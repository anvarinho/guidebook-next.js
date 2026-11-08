import { test, expect } from '@playwright/test';
import { i18n } from '../../src/lib/i18n.config';

test('sitemap index and language shards preserve every URL and language alternate', async ({ page, request }) => {
  const index = await request.get('/sitemap.xml');
  expect(index.status()).toBe(200);
  expect(index.headers()['content-type']).toContain('application/xml');
  const xml = await index.text();
  expect(Buffer.byteLength(xml)).toBeLessThan(15000);
  const urls = await page.evaluate(xml => {
    const document = new DOMParser().parseFromString(xml, 'application/xml');
    if (document.querySelector('parsererror')) throw Error('Invalid sitemap index XML');
    return [...document.querySelectorAll('sitemap > loc')].map(node => node.textContent!);
  }, xml);
  expect(urls).toHaveLength(i18n.locales.length);
  for (const url of urls) {
    const path = new URL(url).pathname;
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    const body = await response.text();
    expect(Buffer.byteLength(body)).toBeLessThan(1_000_000);
    const entries = await page.evaluate(xml => {
      const document = new DOMParser().parseFromString(xml, 'application/xml');
      if (document.querySelector('parsererror')) throw Error('Invalid sitemap shard XML');
      return [...document.querySelectorAll('url')].map(node => ({
        url: node.querySelector('loc')!.textContent!,
        alternateCount: node.getElementsByTagNameNS('http://www.w3.org/1999/xhtml', 'link').length,
      }));
    }, body);
    expect(entries).toHaveLength(11);
    expect(entries.every(entry => entry.alternateCount === i18n.locales.length + 1)).toBe(true);
    expect(entries.some(entry => entry.url.endsWith('/places/fixture-lake'))).toBe(true);
    expect(entries.some(entry => entry.url.endsWith('/articles/fixture-story'))).toBe(true);
    expect(entries.some(entry => entry.url.endsWith('/tours/fixture-tour'))).toBe(true);
  }
});

test('invalid sitemap shard identifiers return 404', async ({ request }) => {
  for (const id of ['xx-0', 'en-999', 'en--1']) {
    expect((await request.get(`/sitemaps/sitemap/${id}.xml`)).status()).toBe(404);
  }
});
