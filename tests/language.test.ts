import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { proxy } from '../src/proxy';

test('root uses an allowlisted preference with English fallback and private nonpermanent redirect', () => {
  for (const [cookie, expected] of [['ru', 'ru'], ['ae', 'ae'], ['unknown', 'en'], ['//evil.test', 'en'], ['', 'en']]) {
    const request = new NextRequest('https://example.test/?campaign=guide', { headers: { cookie: `lang=${cookie}` } });
    const response = proxy(request);
    assert.equal(response.status, 307);
    assert.equal(response.headers.get('location'), `https://example.test/${expected}?campaign=guide`);
    assert.match(response.headers.get('cache-control') || '', /private.*no-store/);
    assert.match(response.headers.get('vary') || '', /Cookie/);
  }
});

test('an explicit localized URL is not redirected by a different saved preference', () => {
  const response = proxy(new NextRequest('https://example.test/fr/places', { headers: { cookie: 'lang=ru' } }));
  assert.equal(response.headers.get('location'), null);
  assert.equal(response.headers.get('x-middleware-next'), '1');
});

test('root is not overridden by a permanent Next config redirect', async () => {
  const config = (await import('../next.config.js')).default;
  const resolved = typeof config === 'function' ? config('phase-production-server') : config;
  const redirects = await resolved.redirects!();
  assert.equal(redirects.some((entry: { source: string }) => entry.source === '/'), false);
});
