const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');

// Exercise the real component with a deterministic hook/timer host. No network,
// Next server, browser, or database is needed; native button semantics have an
// additional source integration check in content-rendering.test.cjs.
function mount({ reduced = false, items = ['one.jpg', 'two.jpg'], lang = 'en' } = {}) {
  const states = [], effects = [], timers = new Map();
  let cursor = 0, dirty = true, tree, nextTimer = 0, preferenceListener;
  const hooks = {
    ...React,
    useState(initial) {
      const slot = cursor++;
      if (!(slot in states)) states[slot] = initial;
      return [states[slot], value => { const next = typeof value === 'function' ? value(states[slot]) : value; if (next !== states[slot]) { states[slot] = next; dirty = true; } }];
    },
    useEffect(effect, deps) {
      const slot = cursor++;
      if (!effects[slot] || deps.some((v, i) => v !== effects[slot].deps[i])) {
        effects[slot]?.cleanup?.();
        effects[slot] = { deps, effect, pending: true };
      }
    },
  };
  const module = { exports: {} };
  const source = fs.readFileSync(require.resolve('../src/app/[lang]/Components/image/ImageSlider.tsx'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.React } }).outputText;
  const media = { matches: reduced, addEventListener: (_, listener) => { preferenceListener = listener; }, removeEventListener() {} };
  vm.runInNewContext(code, {
    exports: module.exports, module, process: { env: { NEXT_PUBLIC_URL: 'https://example.com' } },
    require: name => name === 'react' ? hooks : name === 'next/image' ? () => null : name.endsWith('.css') ? {} : { imagePlaceholder: () => ({}) },
    window: { matchMedia: () => media }, setInterval: fn => { timers.set(++nextTimer, fn); return nextTimer; }, clearInterval: id => timers.delete(id),
  });
  function render() {
    do {
      dirty = false; cursor = 0;
      tree = module.exports.default({ items, priority: false, lang });
      effects.forEach(entry => { if (entry.pending) { entry.pending = false; entry.cleanup = entry.effect(); } });
    } while (dirty);
    return tree;
  }
  function all(node = tree) { return !node || typeof node !== 'object' ? [] : [node, ...React.Children.toArray(node.props?.children).flatMap(all)]; }
  render();
  return {
    get nodes() { return all(); },
    get timerCount() { return timers.size; },
    action(fn) { fn(); render(); },
    tick() { [...timers.values()].forEach(fn => fn()); render(); },
    preference(value) { media.matches = value; preferenceListener(); render(); },
    unmount() { effects.forEach(e => e.cleanup?.()); },
  };
}
const button = (host, label) => host.nodes.find(n => n.type === 'button' && n.props['aria-label'] === label);
const active = host => host.nodes.filter(n => n.props?.['aria-roledescription'] === 'slide' && !n.props['aria-hidden']);
test('native navigation wraps and selected indicator matches the only accessible slide', () => {
  const host = mount();
  assert.equal(active(host).length, 1);
  assert.equal(active(host)[0].props['aria-label'], '1 of 2');
  host.action(() => button(host, 'Previous slide').props.onClick());
  assert.equal(active(host)[0].props['aria-label'], '2 of 2');
  assert.equal(button(host, 'Go to slide 2').props['aria-current'], 'true');
  assert.ok(host.nodes.find(n => n.props?.['aria-roledescription'] === 'slide' && n.props['aria-hidden']).props.inert);
  host.action(() => button(host, 'Next slide').props.onClick());
  assert.equal(active(host)[0].props['aria-label'], '1 of 2');
});
test('focus and pointer stop autoplay until explicit resume; unmount clears timers', () => {
  for (const event of ['onFocusCapture', 'onPointerEnter']) {
    const host = mount();
    assert.equal(host.timerCount, 1);
    host.tick();
    assert.equal(active(host)[0].props['aria-label'], '2 of 2');
    host.action(() => host.nodes[0].props[event]());
    assert.equal(host.timerCount, 0);
    host.tick();
    assert.equal(active(host)[0].props['aria-label'], '2 of 2');
    host.action(() => button(host, 'Resume slideshow').props.onClick());
    assert.equal(host.timerCount, 1);
    host.action(() => button(host, 'Pause slideshow').props.onClick());
    assert.equal(host.timerCount, 0);
    host.unmount();
    assert.equal(host.timerCount, 0);
  }
});
test('reduced motion disables initial autoplay and preference changes stop rotation', () => {
  const host = mount({ reduced: true });
  assert.equal(host.timerCount, 0);
  host.action(() => button(host, 'Resume slideshow').props.onClick());
  assert.equal(host.timerCount, 1);
  host.preference(true);
  assert.equal(host.timerCount, 0);
});
test('single image has no controls and does not autoplay', () => {
  const host = mount({ items: ['one.jpg'] });
  assert.equal(host.timerCount, 0);
  assert.equal(host.nodes.filter(n => n.type === 'button').length, 0);
});

test('carousel names follow the explicitly selected locale', () => {
  const host = mount({ lang: 'ru' });
  assert.ok(button(host, 'Следующий слайд'));
  assert.ok(button(host, 'Предыдущий слайд'));
  assert.equal(active(host)[0].props['aria-label'], '1 из 2');
  assert.equal(button(host, 'Next slide'), undefined);
});
