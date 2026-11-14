import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beaconUrl, trafficSourceQuery } from '../src/lib/trafficSource';

const OWN = 'central-asia.live';

test('search and social referrers are reduced to a bare hostname', () => {
  assert.equal(trafficSourceQuery('https://www.google.com/', OWN, ''), '?ref=google.com');
  assert.equal(trafficSourceQuery('https://www.bing.com/search?q=kyrgyzstan+travel', OWN, ''), '?ref=bing.com');
  assert.equal(trafficSourceQuery('https://t.co/AbC123', OWN, ''), '?ref=t.co');
  assert.equal(trafficSourceQuery('android-app://com.google.android.googlequicksearchbox/', OWN, ''), '?ref=com.google.android.googlequicksearchbox');
});

test('direct visits, own site and malformed referrers send no source', () => {
  assert.equal(trafficSourceQuery('', OWN, ''), '');
  assert.equal(trafficSourceQuery('https://central-asia.live/en/places', OWN, ''), '');
  assert.equal(trafficSourceQuery('https://www.central-asia.live/', OWN, ''), '');
  assert.equal(trafficSourceQuery('not a url', OWN, ''), '');
});

test('campaign tags are kept, trimmed and bounded; other params are ignored', () => {
  assert.equal(
    trafficSourceQuery('', OWN, '?utm_source=newsletter&utm_medium=email&utm_campaign=autumn&fbclid=secret&email=a@b.c'),
    '?utm_source=newsletter&utm_medium=email&utm_campaign=autumn',
  );
  const long = trafficSourceQuery('', OWN, '?utm_source=' + 'x'.repeat(500));
  assert.equal(new URLSearchParams(long).get('utm_source')!.length, 60);
});

test('referrer and campaign combine; paths and search terms never leak', () => {
  const q = trafficSourceQuery('https://duckduckgo.com/?q=private+search', OWN, '?utm_source=ad');
  assert.equal(q, '?ref=duckduckgo.com&utm_source=ad');
  assert.ok(!q.includes('private'));
});

test('every beacon names its page; the source is appended only when present', () => {
  assert.equal(beaconUrl('/he/articles/best-time-to-visit-kyrgyzstan'), '/rum?p=/he/articles/best-time-to-visit-kyrgyzstan');
  assert.equal(beaconUrl('/en', '?ref=google.com&utm_source=ad'), '/rum?p=/en&ref=google.com&utm_source=ad');
  assert.equal(beaconUrl('/'), '/rum?p=/');
});

test('unsafe or oversized paths are left out instead of being logged', () => {
  assert.equal(beaconUrl('/en/places/x?token=secret'), '/rum');
  assert.equal(beaconUrl('/en/places/a b'), '/rum');
  assert.equal(beaconUrl('/en/"},{"x":"1'), '/rum');
  assert.equal(beaconUrl('/' + 'a'.repeat(300)), '/rum');
  assert.equal(beaconUrl('/en/x&ref=evil.com', '?ref=google.com'), '/rum?ref=google.com');
});
