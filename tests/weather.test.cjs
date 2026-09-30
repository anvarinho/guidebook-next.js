const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadModule(file, imports = {}, globals = {}) {
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  const module = { exports: {} };
  vm.runInNewContext(outputText, {
    module, exports: module.exports,
    require: name => name === 'server-only' ? {} : imports[name],
    process: { env: {} },
    fetch: () => { throw new Error('Weather must come from the backend'); },
    URLSearchParams, AbortSignal, ...globals,
  }, { filename: file });
  return module.exports;
}

const location = { latitude: '42.52', longitude: '72.24' };

test('list cards preserve database conditions without a provider override', async () => {
  const stored = { temp: '20', main: 'Clear', description: 'sunny', icon: '01d' };
  const places = loadModule('src/lib/getPlacesWithWeather.ts', {
    react: { cache: fn => fn },
    './getAllPlaces': async () => [{ url: 'bishkek', location, weather: stored }],
  });
  const result = await places.default('en');
  assert.equal(result[0].weather, stored);
});

test('place weather matches the listing database instead of differing detail conditions', async () => {
  const stored = { temp: '0', main: 'Clear', description: 'sunny', icon: '01d' };
  const resolver = loadModule('src/lib/getPlaceWeather.ts', {
    './getPlacesWithWeather': async () => [{ url: 'bishkek', weather: stored }],
  });
  assert.equal(await resolver.default('bishkek', 'en', { temp: '18', icon: '03d' }), stored);
});

test('place weather uses backend detail data and hides when backend weather is missing', async () => {
  const detail = { temp: '16', icon: '01d' };
  const resolver = loadModule('src/lib/getPlaceWeather.ts', {
    './getPlacesWithWeather': async () => { throw new Error('offline'); },
  });
  assert.equal(await resolver.default('bishkek', 'en', detail), detail);
  assert.equal(await resolver.default('lake', 'en'), undefined);
});

test('missing or invalid backend weather hides the card without querying a provider', async () => {
  const resolver = loadModule('src/lib/getPlaceWeather.ts', {
    './getPlacesWithWeather': async () => [{ url: 'lake', weather: { temp: 'invalid' } }],
  });
  assert.equal(await resolver.default('lake', 'en'), undefined);
  assert.equal(await resolver.default('lake', 'en', { temp: '' }), undefined);
});
