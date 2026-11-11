import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import postcss from 'postcss';

const css = readFileSync(new URL('../src/app/[lang]/Components/motion/motion.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/app/[lang]/layout.tsx', import.meta.url), 'utf8');
const hiding = /opacity:\s*0\b|filter:\s*blur|visibility:\s*visible/;

test('content is only hidden after the head script enabled motion', () => {
  postcss.parse(css).walkRules(rule => {
    if (rule.parent?.type === 'atrule' && /keyframes/.test((rule.parent as postcss.AtRule).name)) return;
    const declarations = rule.nodes.filter((node): node is postcss.Declaration => node.type === 'decl');
    if (declarations.some(declaration => declaration.prop === 'opacity' && declaration.value.trim() === '0')) {
      assert.match(rule.selector, /^html\[data-motion\]/, `${rule.selector} hides content without JavaScript`);
    }
  });
  assert.ok(hiding.test(css));
});

test('hidden states have a fail-safe for pages that never hydrate', () => {
  assert.match(css, /html\[data-motion="pending"\][^{]*\[data-reveal\]:not\(\[data-shown\]\)[^{]*\{\s*animation: motion-failsafe 0s \d+s forwards/);
  assert.match(css, /@keyframes motion-failsafe\s*\{\s*to\s*\{\s*opacity: 1; transform: none; filter: none;/);
  assert.match(css, /html\[data-motion="pending"\] \[data-hero-track\]::after \{ animation: hero-failsafe/);
});

test('motion is skipped under reduced motion before the first paint', () => {
  assert.match(layout, /prefers-reduced-motion: reduce\)'\)\.matches\)document\.documentElement\.dataset\.motion='pending'/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*opacity: 1 !important; transform: none !important; filter: none !important/);
});
