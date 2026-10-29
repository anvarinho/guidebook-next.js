const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

test('place and tour descriptions use the server sanitizer before the HTML sink', () => {
  for (const file of ['src/app/[lang]/places/[placeUrl]/components/PlaceDescripiton.tsx', 'src/app/[lang]/tours/[tourUrl]/TourDescription.tsx']) {
    assert.match(read(file), /renderContentHtml\(/);
    assert.doesNotMatch(read(file), /html\.replace/);
  }
});

test('all JSON-LD script sinks escape script-closing content', () => {
  function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : /\.[jt]sx?$/.test(e.name) ? [path.join(dir, e.name)] : []);
  }
  for (const file of walk(path.join(root, 'src'))) {
    const source = fs.readFileSync(file, 'utf8');
    if (source.includes('dangerouslySetInnerHTML')) assert.doesNotMatch(source, /__html:\s*JSON\.stringify\(/, file);
  }
});

test('carousel exposes labeled native controls, slide visibility, and motion controls', () => {
  const source = read('src/app/[lang]/Components/image/ImageSlider.tsx');
  assert.doesNotMatch(source, /<span[^>]+onClick/);
  assert.doesNotMatch(source, /<picture[^>]+role=/, 'picture does not support ARIA slide semantics');
  for (const feature of ['<button', 'aria-label=', 'aria-current=', 'aria-hidden=', 'onFocusCapture=', 'onPointerEnter=', 'prefers-reduced-motion', 'Pause slideshow', 'Resume slideshow']) assert.ok(source.includes(feature), feature);
});
