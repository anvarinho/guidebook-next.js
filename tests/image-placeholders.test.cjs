const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const sharp = require('sharp');

function load(file, imports) {
  const module = { exports: {} };
  const { outputText } = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  vm.runInNewContext(outputText, {
    module, exports: module.exports, URL,
    process: { env: { NEXT_PUBLIC_URL: 'https://example.test' } },
    fetch: () => { throw new Error('Preview lookup must never fetch an image'); },
    require: name => {
      if (name === 'server-only') return {};
      if (!(name in imports)) throw new Error(`Unexpected runtime dependency: ${name}`);
      return imports[name];
    },
  });
  return module.exports;
}

test('preview lookup is synchronous and handles local, remote and missing images', () => {
  const getBase64 = load('src/lib/getLocalBase64.ts', {
    './generated/image-placeholders.json': {
      '/intro/optimized/sky.webp': 'sky-preview',
      'https://example.test/uploads/lake.jpg': 'lake-preview',
    },
  }).default;
  assert.equal(getBase64('/intro/optimized/sky.webp'), 'sky-preview');
  assert.equal(getBase64('https://example.test/intro/optimized/sky.webp'), 'sky-preview');
  assert.equal(getBase64('uploads/lake.jpg'), 'lake-preview');
  assert.equal(getBase64('https://other.test/intro/optimized/sky.webp'), '');
  assert.equal(getBase64('/uploads/new.jpg'), '');
  assert.equal(getBase64(), '');
});

test('gallery previews preserve input order and duplicates', () => {
  const getPreviews = load('src/lib/getBlurredDataUrls.ts', { './getLocalBase64': src => `preview:${src}` }).default;
  assert.deepEqual(Array.from(getPreviews(['one', 'two', 'one'])), ['preview:one', 'preview:two', 'preview:one']);
  assert.equal(getPreviews([]).length, 0);
});

test('generated previews are valid inline images no larger than 16 pixels', async () => {
  const manifest = JSON.parse(fs.readFileSync('src/lib/generated/image-placeholders.json', 'utf8'));
  assert.ok(Object.keys(manifest).length > 0);
  for (const [source, preview] of Object.entries(manifest)) {
    assert.ok(preview.startsWith('data:image/webp;base64,'), source);
    assert.ok(preview.length < 1200, source);
    const image = await sharp(Buffer.from(preview.split(',')[1], 'base64')).metadata();
    assert.ok(image.width <= 16 && image.height <= 16, source);
  }
});

test('missing previews do not show unrelated placeholder artwork', () => {
  const { imagePlaceholder } = load('src/lib/imagePlaceholder.ts', {});
  assert.equal(imagePlaceholder().placeholder, 'empty');
  assert.equal(imagePlaceholder('').placeholder, 'empty');
  assert.equal(imagePlaceholder('photo-preview').blurDataURL, 'photo-preview');
  assert.equal(imagePlaceholder('photo-preview').placeholder, 'blur');
});

test('generator includes photos from wrapped place listings and detail responses', async () => {
  let manifest;
  const requests = [];
  const sharpMock = () => {
    const pipeline = { rotate: () => pipeline, resize: () => pipeline, webp: () => pipeline,
      toBuffer: async () => Buffer.from('preview') };
    return pipeline;
  };
  await vm.runInNewContext(fs.readFileSync('scripts/generate-image-placeholders.cjs', 'utf8'), {
    __dirname: '/project/scripts', Buffer, URL, AbortSignal,
    console: { log() {}, warn() {}, error(message) { throw new Error(message); } },
    process: { argv: ['node', 'generator', '--remote'], env: { NEXT_PUBLIC_URL: 'https://example.test' } },
    fetch: async url => {
      requests.push(url);
      const data = url.includes('/places/more')
        ? { count: 1, places: [{ url: 'lake', images: ['uploads/cover.jpg'] }] }
        : url.includes('/places/lake') ? { images: ['uploads/detail.jpg'] } : [];
      return { ok: true, json: async () => data, body: [Buffer.from('image')] };
    },
    require: name => {
      if (name === 'dotenv') return { config() {} };
      if (name === 'sharp') return sharpMock;
      if (name === 'node:path') return require(name);
      if (name === 'node:fs/promises') return {
        readFile: async () => '{}', readdir: async () => [], mkdir: async () => {},
        writeFile: async (_, content) => { manifest = JSON.parse(content); },
      };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  assert.ok(requests.includes('https://example.test/api/places/lake?lang=en'));
  assert.ok(manifest['https://example.test/uploads/cover.jpg']);
  assert.ok(manifest['https://example.test/uploads/detail.jpg']);
});
