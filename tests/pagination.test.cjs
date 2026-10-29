const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

function handler(getContent) {
  const module = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync('src/app/api/places/more/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require(name) {
    if (name === '@/lib/contentApi') return { getContent };
    if (name === '@/lib/contentSchemas') return { paginatedPlacesSchema: {} };
    if (name === '@/lib/getLocalBase64') return () => undefined;
    if (name === '@/lib/i18n.config') return { i18n: { locales: ['en', 'ru'] } };
    return require(name);
  } });
  return module.exports.GET;
}

test('pagination validates inputs before fetching and preserves validated results', async () => {
  let fetched = 0;
  const get = handler(async (_path, _schema, params) => {
    fetched++;
    assert.equal(params.lang, 'ru');
    assert.equal(params.offset, '12');
    assert.equal(params.limit, '12');
    return { count: 1, places: [{ url: 'fixture-lake', images: ['bozteri.jpg'] }] };
  });
  for (const query of ['lang=xx', 'offset=-1', 'offset=1.5', 'offset=Infinity']) {
    assert.equal((await get(new NextRequest(`http://localhost/api/places/more?${query}`))).status, 400);
  }
  assert.equal(fetched, 0);
  const response = await get(new NextRequest('http://localhost/api/places/more?lang=ru&offset=12'));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).places[0].url, 'fixture-lake');
});

test('pagination backend failures return safe JSON 502 rather than an unhandled error', async () => {
  const get = handler(async () => { throw Error('private upstream error details'); });
  const response = await get(new NextRequest('http://localhost/api/places/more'));
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: 'Places are temporarily unavailable' });
});
