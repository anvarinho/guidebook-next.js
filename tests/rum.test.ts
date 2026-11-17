import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENGAGED_MS, classifyClick, connectionBucket, deviceBucket, errorHash, isEngaged, navigationBucket, randomId, retryDelay, rumUrl, scrollPercent } from '../src/lib/rum';

test('viewport width maps to mobile, tablet or desktop', () => {
  assert.deepEqual([320, 767, 768, 1099, 1100, 2560].map(deviceBucket), ['m', 'm', 't', 't', 'd', 'd']);
});

test('only known connection types are reported', () => {
  assert.equal(connectionBucket('4g'), '4g');
  assert.equal(connectionBucket('slow-2g'), 'slow-2g');
  assert.equal(connectionBucket('wifi'), undefined);
  assert.equal(connectionBucket(undefined), undefined);
});

test('scroll depth is a bounded whole percent of the page seen', () => {
  assert.equal(scrollPercent(0, 800, 8000), 10);
  assert.equal(scrollPercent(7200, 800, 8000), 100);
  assert.equal(scrollPercent(99999, 800, 8000), 100);
  assert.equal(scrollPercent(0, 800, 0), 0);
});

test('clicks are classified by what they open', () => {
  assert.equal(classifyClick('https://wa.me/996555000000?text=hi', null), 'wa');
  assert.equal(classifyClick('tel:+996555000000', null), 'tel');
  assert.equal(classifyClick('mailto:a@b.c', null), 'mail');
  assert.equal(classifyClick('/en/contact', null), 'contact');
  assert.equal(classifyClick('/ru/contact?from=nav', null), 'contact');
  assert.equal(classifyClick('/en/places', null), null);
  assert.equal(classifyClick('https://example.com/contact', null), null);
  assert.equal(classifyClick(null, 'lang'), 'lang');
  assert.equal(classifyClick('/en/places', 'more'), 'more');
  assert.equal(classifyClick('/en/places', 'unknown'), null);
});

test('beacon URLs carry the page, whole-number fields and the source, and drop empty values', () => {
  assert.equal(rumUrl('/en/places/x', { e: 'v', vi: 'ab12cd', d: 'm', n: 1, s: undefined, c: '' }), '/rum?p=/en/places/x&e=v&vi=ab12cd&d=m&n=1');
  assert.equal(rumUrl('/en', { e: 'l', t: 12.6, sd: 47.2, lcp: 1834.4 }), '/rum?p=/en&e=l&t=13&sd=47&lcp=1834');
  assert.equal(rumUrl('/en', { e: 'v' }, '?ref=google.com'), '/rum?p=/en&e=v&ref=google.com');
  assert.equal(rumUrl('/en', {}), '/rum?p=/en');
  assert.equal(rumUrl('/bad path?x', { e: 'wa' }), '/rum?e=wa');
});

test('a view is engaged after ten visible seconds or on a real interaction', () => {
  assert.equal(isEngaged(0, false), false);
  assert.equal(isEngaged(ENGAGED_MS - 1, false), false);
  assert.equal(isEngaged(ENGAGED_MS, false), true);
  assert.equal(isEngaged(1200, true), true);
});

test('navigation types map to one letter and unknown ones to nothing', () => {
  assert.deepEqual(['navigate', 'reload', 'back_forward', 'prerender', 'x', undefined].map(navigationBucket), ['n', 'r', 'b', 'p', undefined, undefined]);
});

test('only rate limits and server errors are retried, after a bounded wait', () => {
  assert.equal(retryDelay(204, null), null);
  assert.equal(retryDelay(403, null), null);
  assert.equal(retryDelay(413, '3'), null);
  assert.equal(retryDelay(429, null), 2000);
  assert.equal(retryDelay(429, '3'), 3000);
  assert.equal(retryDelay(429, '0'), 2000);
  assert.equal(retryDelay(429, '120'), 5000);
  assert.equal(retryDelay(503, 'soon'), 2000);
});

test('view ids are eight lowercase alphanumerics and error hashes are stable eight hex digits', () => {
  assert.match(randomId(), /^[a-z0-9]{8}$/);
  assert.notEqual(randomId(), randomId());
  assert.match(errorHash('x is not a function', 'https://a.example/_next/app.js?v=1'), /^[0-9a-f]{8}$/);
  assert.equal(errorHash('boom', '/a.js?x=1'), errorHash('boom', '/a.js?x=2'));
  assert.notEqual(errorHash('boom', '/a.js'), errorHash('bang', '/a.js'));
});

test('beacon URLs carry the new fields', () => {
  assert.equal(rumUrl('/en', { e: 'g', vi: 'abcd1234', q: 3, t: 11 }), '/rum?p=/en&e=g&vi=abcd1234&q=3&t=11');
  assert.equal(rumUrl('/en', { e: 'l', lt: 'i', ttfb: 212.4, nt: undefined }), '/rum?p=/en&e=l&lt=i&ttfb=212');
});
