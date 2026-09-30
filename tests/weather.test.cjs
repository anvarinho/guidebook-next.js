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
    process: { env: { OPENWEATHER_API_KEY: 'test-key' } },
    URLSearchParams, AbortSignal, ...globals,
  }, { filename: file });
  return module.exports;
}

const location = { latitude: '42.52', longitude: '72.24' };

test('weather uses destination coordinates and preserves zero Celsius', async () => {
  let requested;
  const provider = loadModule('src/lib/getWeatherData.tsx', {}, {
    fetch: async (url, options) => {
      requested = new URL(url);
      assert.equal(options.next.revalidate, 300);
      return { ok: true, json: async () => ({ main: { temp: 0 }, weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }] }) };
    },
  });
  const conditions = await provider.getCoordinateWeather(location, 'jp');
  assert.equal(conditions.temp, '0');
  assert.equal(requested.searchParams.get('lat'), '42.52');
  assert.equal(requested.searchParams.get('lon'), '72.24');
  assert.equal(requested.searchParams.has('q'), false);
  assert.equal(requested.searchParams.get('lang'), 'ja');
});

test('invalid coordinates and provider outages do not break a place page', async () => {
  let calls = 0;
  const provider = loadModule('src/lib/getWeatherData.tsx', {}, {
    fetch: async () => { calls++; throw new Error('offline'); },
  });
  assert.equal(await provider.getCoordinateWeather({ latitude: '', longitude: '72' }, 'en'), undefined);
  assert.equal(calls, 0);
  assert.equal(await provider.getCoordinateWeather(location, 'en'), undefined);
  assert.equal(calls, 1);
});

test('list cards preserve database conditions without a provider override', async () => {
  const stored = { temp: '20', main: 'Clear', description: 'sunny', icon: '01d' };
  const places = loadModule('src/lib/getPlacesWithWeather.ts', {
    react: { cache: fn => fn },
    './getAllPlaces': async () => [{ url: 'bishkek', location, weather: stored }],
  });
  const result = await places.default('en');
  assert.equal(result[0].weather, stored);
});

test('place weather matches the listing database even when provider conditions differ', async () => {
  const stored = { temp: '0', main: 'Clear', description: 'sunny', icon: '01d' };
  let providerCalls = 0;
  const resolver = loadModule('src/lib/getPlaceWeather.ts', {
    './getPlacesWithWeather': async () => [{ url: 'bishkek', weather: stored }],
    './getWeatherData': { getCoordinateWeather: async () => { providerCalls++; return { temp: '18', icon: '03d' }; } },
  });
  assert.equal(await resolver.default('bishkek', 'en', location, { temp: '18', icon: '03d' }), stored);
  assert.equal(providerCalls, 0);
});

test('place weather uses detail data then coordinates when no listing weather is available', async () => {
  const detail = { temp: '16', icon: '01d' };
  const fallback = { temp: '15', icon: '03d' };
  let providerCalls = 0;
  const resolver = loadModule('src/lib/getPlaceWeather.ts', {
    './getPlacesWithWeather': async () => { throw new Error('offline'); },
    './getWeatherData': { getCoordinateWeather: async () => { providerCalls++; return fallback; } },
  });
  assert.equal(await resolver.default('bishkek', 'en', location, detail), detail);
  assert.equal(providerCalls, 0);
  assert.equal(await resolver.default('lake', 'en', location), fallback);
  assert.equal(providerCalls, 1);
});
