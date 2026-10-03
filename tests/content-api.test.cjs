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
      module, exports: module.exports, fetch, URLSearchParams,
      process: { env: { NEXT_PUBLIC_URL: 'https://example.test/' } },
      require: name => {
        const base = path.resolve(path.dirname(file), name);
        return load(fs.existsSync(`${base}.ts`) ? `${base}.ts` : `${base}.tsx`);
      },
    }, { filename: file });
    return module.exports;
  }
  return load;
}

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
    return { ok: true, json: async () => ({ title: 'Test' }) };
  });
  for (const name of ['Place', 'Tour', 'Article']) {
    const detail = load(`src/lib/get${name}.tsx`).default;
    assert.equal(load(`src/lib/getAll${name}s.tsx`)[`get${name}`], detail);
    await detail('a/b?', 'ru');
    assert.equal(requests.at(-1), `https://example.test/api/${name.toLowerCase()}s/a%2Fb%3F?lang=ru`);
  }
});

test('only missing detail content returns undefined; server failures propagate', async () => {
  for (const status of [404, 500]) {
    const load = loadContentModules(async () => ({ ok: false, status }));
    const getPlace = load('src/lib/getPlace.tsx').default;
    if (status === 404) assert.equal(await getPlace('missing', 'en'), undefined);
    else await assert.rejects(getPlace('missing', 'en'), /500/);
    await assert.rejects(load('src/lib/getAllPlaces.tsx').default('en'), new RegExp(String(status)));
  }
});
