import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyClick, connectionBucket, deviceBucket, rumUrl, scrollPercent } from '../src/lib/rum';

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
