import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enterProgress, exitProgress, sectionProgress, sectionStops } from '../src/app/[lang]/Components/motion/progress';

const css = readFileSync(new URL('../src/app/[lang]/Components/motion/motion.css', import.meta.url), 'utf8');

test('arrivals and departures follow scroll position in both directions', () => {
  // An element 1000px down the page, in an 800px viewport, arriving over 200px.
  assert.equal(enterProgress(1000, 0, 800, 200), 0);
  assert.equal(enterProgress(1000, 200, 800, 200), 0);
  assert.equal(enterProgress(1000, 300, 800, 200), .5);
  assert.equal(enterProgress(1000, 5000, 800, 200), 1);
  assert.equal(enterProgress(1000, 336, 800, 200, 36), .5);
  // A 400px photo leaves between its top and its bottom reaching the top of the viewport.
  assert.equal(exitProgress(300, 400, 300, 800), 0);
  assert.equal(exitProgress(300, 400, 500, 800), .5);
  assert.equal(exitProgress(300, 400, 9000, 800), 1);
  // Taller than the viewport: it starts leaving once its bottom edge is on screen.
  assert.equal(exitProgress(0, 2000, 1200, 800), 0);
  assert.equal(exitProgress(0, 2000, 1600, 800), .5);
});

test('section stops are proportional and every line can fill before the page ends', () => {
  const boxes = [{ top: 400, bottom: 1000 }, { top: 1000, bottom: 3000 }, { top: 3000, bottom: 3400 }];
  assert.deepEqual(sectionStops(boxes, 100, 10000, 800), [300, 900, 2900, 3300]);
  assert.deepEqual(sectionProgress([300, 900, 2900, 3300], 0), { index: -1, progress: [0, 0, 0] });
  assert.deepEqual(sectionProgress([300, 900, 2900, 3300], 1900), { index: 1, progress: [1, .5, 0] });
  assert.equal(sectionProgress([300, 900, 2900, 3300], 99999).index, 2);
  // The page ends at 3000: the last stops are squeezed into the final screen of scrolling.
  const squeezed = sectionStops(boxes, 100, 3000, 800);
  assert.equal(squeezed.at(-1), 3000);
  assert.deepEqual(squeezed.slice(0, 2), [300, 900]);
  assert.ok(squeezed.every((stop, index) => index === 0 || stop >= squeezed[index - 1]));
  assert.deepEqual(sectionProgress(squeezed, 3000).progress, [1, 1, 1]);
  assert.deepEqual(sectionStops([], 100, 3000, 800), []);
});

test('motion only animates transform and opacity', () => {
  for (const [, name, body] of css.matchAll(/@keyframes (\S+) \{([\s\S]*?)\n\}/g)) {
    const properties = [...body.matchAll(/([a-z-]+):/g)].map(match => match[1]);
    assert.ok(properties.length, name);
    for (const property of properties) assert.match(property, /^(opacity|transform|animation-timing-function)$/, `${name} animates ${property}`);
  }
});

test('nothing is hidden without an animation driving it', () => {
  // Outside @keyframes, opacity: 0 may only belong to the veil, which is decorative.
  const rules = css.replace(/@keyframes[\s\S]*?\n\}/g, '').match(/[^{}]+\{[^{}]*opacity:\s*0[^{}]*\}/g) ?? [];
  assert.equal(rules.length, 1);
  assert.match(rules[0], /\[data-motion~="leave"\]::before/);
  // Every animation is inside the reduced-motion guard, and the fallback needs the controller's flag.
  const guarded = css.slice(css.indexOf('@media (prefers-reduced-motion: no-preference)'));
  assert.equal(css.split('animation:').length, guarded.split('animation:').length);
  const fallback = guarded.slice(guarded.indexOf('@supports not'), guarded.indexOf('/* Keyboard focus'));
  for (const selector of fallback.match(/^\s+[^\s{}][^{}]*\{$/gm) ?? []) {
    if (!selector.includes('@supports')) assert.match(selector, /html\[data-motion="js"\]/);
  }
});
