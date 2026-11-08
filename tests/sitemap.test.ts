import test from 'node:test';
import assert from 'node:assert/strict';
import { i18n } from '../src/lib/i18n.config';
import { parseSitemapId, sitemapEntries, sitemapIds, sitemapIndex, sitemapPaths, SITEMAP_ENTRIES_PER_SHARD } from '../src/lib/sitemap';

test('sitemap shards bound language-alternate expansion without dropping URLs', () => {
  const paths = sitemapPaths({ places: Array.from({ length: 1100 }, (_, n) => ({ placeUrl: `place-${n}` })), articles: [], tours: [] });
  const ids = sitemapIds(paths.length);
  assert.equal(ids.length, i18n.locales.length * 3);
  for (const lang of i18n.locales) {
    const entries = [0, 1, 2].flatMap(part => {
      const shard = sitemapEntries(paths, lang, part);
      assert.ok(shard.length <= SITEMAP_ENTRIES_PER_SHARD);
      return shard;
    });
    assert.equal(entries.length, paths.length);
    assert.equal(new Set(entries.map(entry => entry.url)).size, paths.length);
    assert.ok(entries.every(entry => entry.url.includes(`/${lang}`)));
    assert.equal(Object.keys(entries[0].alternates!.languages!).length, i18n.locales.length + 1);
  }
});

test('sitemap index retains the stable discovery URL and lists every shard', () => {
  const ids = sitemapIds(501);
  const xml = sitemapIndex(ids);
  assert.match(xml, /<sitemapindex /);
  assert.equal((xml.match(/<sitemap>/g) || []).length, i18n.locales.length * 2);
  assert.ok(xml.length < 15000);
  assert.match(xml, /sitemaps\/sitemap\/en-0\.xml/);
  assert.match(xml, /sitemaps\/sitemap\/lt-1\.xml/);
  assert.match(xml, /sitemaps\/sitemap\/fil-1\.xml/);
});

test('sitemap paths preserve dates, escaping, content kinds and deduplicate records', () => {
  const paths = sitemapPaths({ places: [{ placeUrl: 'lake & mountains', lastModified: '2026-10-30' }, { placeUrl: 'lake & mountains', lastModified: '2026-10-30' }], articles: [{ placeUrl: 'story', lastModified: 'invalid' }], tours: [{ tourUrl: 'tour' }] });
  assert.equal(paths.length, 11);
  assert.deepEqual(paths.find(entry => entry.path.startsWith('places/')), { path: 'places/lake%20%26%20mountains', lastModified: '2026-10-30T00:00:00.000Z' });
  assert.equal(paths.find(entry => entry.path === 'articles/story')?.lastModified, undefined);
});

test('invalid sitemap identifiers are rejected before content access', () => {
  for (const id of ['en', 'xx-0', 'en--1', 'en-01', '../en-0', 'en-9999999']) assert.equal(parseSitemapId(id), undefined);
  assert.deepEqual(parseSitemapId('en-2'), { lang: 'en', part: 2 });
  assert.deepEqual(parseSitemapId('fil-0'), { lang: 'fil', part: 0 });
});
