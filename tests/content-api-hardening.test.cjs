const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function loadApi(fetch, env = {}) {
  const modules = new Map();
  function load(file) {
    file = path.resolve(file);
    if (modules.has(file)) return modules.get(file).exports;
    const module = { exports: {} };
    modules.set(file, module);
    const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    });
    vm.runInNewContext(outputText, {
      module, exports: module.exports, fetch, URL, URLSearchParams, AbortSignal,
      process: { env: { CONTENT_API_URL: 'https://api.example.test', SITE_URL: 'https://site.example.test', ...env } },
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
module.exports = { loadApi };

// These exercise the real public loaders rather than a schema or fetch mock alone.
test('content API uses only the configured server origin and retains revalidation', async () => {
  let request;
  const load = loadApi(async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => [] };
  });
  await load('src/lib/getAllPlaces.tsx').default('ru');
  assert.equal(request.url, 'https://api.example.test/api/places?lang=ru');
  assert.equal(request.options.next.revalidate, 60);
  assert.ok(request.options.signal);
});

test('invalid content is rejected at the API boundary without echoing its values', async () => {
  const load = loadApi(async () => ({ ok: true, json: async () => [{ url: 'malformed-record' }] }));
  await assert.rejects(load('src/lib/getAllPlaces.tsx').default('en'), error => {
    assert.match(error.message, /Invalid content response/);
    assert.doesNotMatch(error.message, /malformed-record/);
    return true;
  });
});

test('content requests have a bounded timeout, including response body reads', async () => {
  const load = loadApi(async (_url, options) => {
    return { ok: true, json: () => new Promise((resolve, reject) => {
      options.signal.addEventListener('abort', () => reject(options.signal.reason));
      setTimeout(resolve, 100, []);
    }) };
  }, { CONTENT_API_TIMEOUT_MS: '10' });
  await assert.rejects(load('src/lib/getAllPlaces.tsx').default('en'), /timed out/);
});

test('API configuration is required rather than silently using production', async () => {
  let fetched = false;
  const load = loadApi(async () => { fetched = true; }, { CONTENT_API_URL: '' });
  await assert.rejects(load('src/lib/getAllPlaces.tsx').default('en'), /CONTENT_API_URL/);
  assert.equal(fetched, false);
});

test('validated details strip transport fields and retain legitimate nested data', async () => {
  const fixture = JSON.parse(fs.readFileSync('tests/fixtures/place.json', 'utf8'));
  const load = loadApi(async () => ({ ok: true, json: async () => ({ ...fixture, internalMetadata: { hidden: true } }) }));
  const place = await load('src/lib/getPlace.tsx').default('fixture-lake', 'en');
  assert.equal(place.url, fixture.url);
  assert.equal(place.images.length, 2);
  assert.equal(place.location.latitude, fixture.location.latitude);
  assert.equal(place.internalMetadata, undefined);
});

test('nested malformed content and unsafe image URLs are rejected', async () => {
  const fixture = JSON.parse(fs.readFileSync('tests/fixtures/place.json', 'utf8'));
  for (const invalid of [{ ...fixture, location: { latitude: [] } }, { ...fixture, images: ['javascript:alert(1)'] }]) {
    const load = loadApi(async () => ({ ok: true, json: async () => invalid }));
    await assert.rejects(load('src/lib/getPlace.tsx').default('fixture-lake', 'en'), /Invalid content response/);
  }
});

test('regional summaries omit database IDs while still validating public card fields', async () => {
  const fixture = JSON.parse(fs.readFileSync('tests/fixtures/place.json', 'utf8'));
  const { _id, ...summary } = fixture;
  const load = loadApi(async () => ({ ok: true, json: async () => [summary] }));
  const places = await load('src/lib/getAllPlaces.tsx').getPlacesByRegion('en', summary.region, 'another-place');
  assert.equal(places[0].url, summary.url);
  assert.equal(places[0]._id, undefined);
  const malformed = loadApi(async () => ({ ok: true, json: async () => [{ ...summary, images: [] }] }));
  await assert.rejects(malformed('src/lib/getAllPlaces.tsx').getPlacesByRegion('en', summary.region, 'another-place'), /Invalid content response/);
  const detail = loadApi(async () => ({ ok: true, json: async () => summary }));
  await assert.rejects(detail('src/lib/getPlace.tsx').default(summary.url, 'en'), /Invalid content response/);
});

test('canonical site configuration is independent of API and asset origins', () => {
  const load = loadApi(async () => { throw Error('Unexpected network'); }, { NEXT_PUBLIC_URL: 'https://assets.example.test' });
  const seo = load('src/lib/seo.ts');
  assert.equal(seo.absoluteSiteUrl('ru/places'), 'https://site.example.test/ru/places');
  assert.equal(seo.localizedPageAlternates('places')['x-default'], 'https://site.example.test/en/places');
});

test('API network failures never echo backend exception details', async () => {
  const load = loadApi(async () => { throw Error('private-backend-connection-details'); });
  await assert.rejects(load('src/lib/getAllPlaces.tsx').default('en'), error => {
    assert.equal(error.message, 'Content API request failed');
    return true;
  });
});

test('invalid backend configuration produces a safe configuration error', async () => {
  const load = loadApi(async () => { throw Error('Unexpected network'); }, { CONTENT_API_URL: 'invalid-private-origin' });
  await assert.rejects(load('src/lib/getAllPlaces.tsx').default('en'), error => {
    assert.equal(error.message, 'Invalid CONTENT_API_URL configuration');
    assert.equal(error.input, undefined);
    return true;
  });
});
