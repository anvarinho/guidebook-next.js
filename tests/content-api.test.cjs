const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadContentModules(fetch) {
  const modules = new Map();
  function load(file) {
    file = path.resolve(file);
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} };
    modules.set(file, module);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    });
    vm.runInNewContext(outputText, {
      module, exports: module.exports, fetch, URLSearchParams, URL, AbortSignal,
      process: { env: { CONTENT_API_URL: 'https://example.test/' } },
      require: name => {
        if (name === 'server-only') return {};
        if (name === 'react') return { cache: fn => fn };
        if (!name.startsWith('.')) return require(name);
        const base = path.resolve(path.dirname(file), name);
        return load(fs.existsSync(`${base}.ts`) ? `${base}.ts` : `${base}.tsx`);
      },
    }, { filename: file });
    return module.exports;
  }
  return load;
}

test('all website languages request their own places, tours, and articles', async () => {
  const requests = [];
  const load = loadContentModules(async url => {
    requests.push(url);
    return { ok: true, json: async () => [] };
  });
  const { i18n } = load('src/lib/i18n.config.tsx');
  for (const locale of i18n.locales) {
    for (const collection of ['Places', 'Tours', 'Articles']) {
      await load(`src/lib/getAll${collection}.tsx`).default(locale);
      assert.equal(new URL(requests.at(-1)).searchParams.get('lang'), locale);
    }
  }
  assert.equal(requests.length, i18n.locales.length * 3);
});

test('public loaders consistently cache content and encode query parameters', async () => {
  const requests = [];
  const load = loadContentModules(async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => [] };
  });
  const places = load('src/lib/getAllPlaces.tsx');
  await places.default('ru');
  await places.getPlacesByRegion('en', 'Chuy & Talas', 'a/b');
  await places.getPlacesByURLs('en', ['ala archa', 'bishkek']);
  await load('src/lib/getAllTours.tsx').default('en');
  await load('src/lib/getAllArticles.tsx').default('en');
  assert.equal(requests.length, 5);
  assert.equal(requests[0].url, 'https://example.test/api/places?lang=ru');
  assert.equal(new URL(requests[1].url).searchParams.get('region'), 'Chuy & Talas');
  assert.equal(new URL(requests[1].url).searchParams.get('url'), 'a/b');
  assert.equal(new URL(requests[2].url).searchParams.get('urls'), 'ala archa,bishkek');
  for (const { options } of requests) assert.equal(options.next.revalidate, 60);
});

test('empty related-place lists skip the API instead of fetching all home places', async () => {
  const load = loadContentModules(() => { throw new Error('Unexpected request'); });
  const { getPlacesByURLs } = load('src/lib/getAllPlaces.tsx');
  assert.equal((await getPlacesByURLs('en', [])).length, 0);
  assert.equal((await getPlacesByURLs('en', null)).length, 0);
});

test('legacy detail imports reuse the same loader and encoded request URL', async () => {
  const requests = [];
  const load = loadContentModules(async url => {
    requests.push(url);
    const common = { _id: 'fixture', url: 'test', title: 'Test', images: ['bozteri.jpg'], description: 'Description', viewCount: 0 };
    const data = url.includes('/places/') ? { ...common, name: 'Lake', region: 'Chuy', location: { latitude: '42', longitude: '74' } }
      : url.includes('/tours/') ? { ...common, level: 'Easy', price: [100], days: [{ activities: [], images: [], places: [] }], includings: [], excludings: [] }
      : { ...common, subtitle: 'Subtitle', createdAt: '2026-01-01', paragraphs: [] };
    return { ok: true, json: async () => data };
  });
  for (const name of ['Place', 'Tour', 'Article']) {
    const detail = load(`src/lib/get${name}.tsx`).default;
    assert.equal(load(`src/lib/getAll${name}s.tsx`)[`get${name}`], detail);
    const slug = 'valid-item';
    await detail(slug, 'ru');
    assert.equal(requests.at(-1), `https://example.test/api/${name.toLowerCase()}s/${encodeURIComponent(slug)}?lang=ru`);
    const count = requests.length;
    assert.equal(await detail('a/b?', 'ru'), undefined);
    assert.equal(requests.length, count);
  }
});

test('malformed detail URLs skip the backend for every content collection', async () => {
  let requests = 0;
  const load = loadContentModules(async () => { requests++; throw new Error('Unexpected request'); });
  const invalid = ['', 'a'.repeat(201), 'tour Book it!', 'bişkek-city', 'bi%C5%9Fkek-city',
    'tour%2520Book%2520it!', 'apple-logo.png', '../tour', 'a/b', 'a?b', 'a#b',
    'UPPERCASE', '-tour', 'tour-', 'two--hyphens', 'tour_name'];
  for (const name of ['Place', 'Tour', 'Article']) {
    const detail = load(`src/lib/get${name}.tsx`).default;
    for (const slug of invalid) assert.equal(await detail(slug, 'en'), undefined);
  }
  assert.equal(requests, 0);
});

test('valid slug boundaries reach the API and genuine upstream failures propagate', async () => {
  const calls = [];
  const load = loadContentModules(async url => { calls.push(url); return { ok: false, status: 503 }; });
  for (const name of ['Place', 'Tour', 'Article']) {
    for (const slug of ['a', '123', 'tour-123-name', 'a'.repeat(200)]) {
      await assert.rejects(load(`src/lib/get${name}.tsx`).default(slug, 'en'), /503/);
    }
  }
  assert.equal(calls.length, 12);
});

test('only missing detail content returns undefined; server failures propagate', async () => {
  for (const status of [404, 400, 500]) {
    const load = loadContentModules(async () => ({ ok: false, status }));
    const getPlace = load('src/lib/getPlace.tsx').default;
    if (status === 404) assert.equal(await getPlace('missing', 'en'), undefined);
    else await assert.rejects(getPlace('missing', 'en'), new RegExp(String(status)));
    await assert.rejects(load('src/lib/getAllPlaces.tsx').default('en'), new RegExp(String(status)));
  }
});
