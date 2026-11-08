import type { MetadataRoute } from 'next';
import { i18n, type Locale } from './i18n.config';
import { absoluteSiteUrl, localizedPageAlternates } from './seo';
import { transferUpdated } from '@/app/[lang]/manas-airport-transfers/seo';

// Each URL has every language alternate plus x-default. Bound the XML expansion per response,
// rather than constructing the previous 59 MB response across all 50 locales.
export const SITEMAP_ENTRIES_PER_SHARD = 500;
export type SitemapPath = { path: string; lastModified?: string };
type Sources = {
  places: { placeUrl: string; lastModified?: string | Date }[];
  articles: { placeUrl: string; lastModified?: string | Date }[];
  tours: { tourUrl: string }[];
};

function modified(value: string | Date | undefined) {
  if (!value) return undefined;
  const date = new Date(value instanceof Date ? value.getTime() : value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function sitemapPaths({ places, articles, tours }: Sources): SitemapPath[] {
  const paths: SitemapPath[] = ['', 'places', 'tours', 'about', 'articles', 'contact', 'manas', 'manas-airport-transfers']
    .map(path => ({ path, lastModified: path === 'manas-airport-transfers' ? transferUpdated : undefined }));
  for (const place of places) paths.push({ path: `places/${encodeURIComponent(place.placeUrl)}`, lastModified: modified(place.lastModified) });
  for (const article of articles) paths.push({ path: `articles/${encodeURIComponent(article.placeUrl)}`, lastModified: modified(article.lastModified) });
  for (const tour of tours) paths.push({ path: `tours/${encodeURIComponent(tour.tourUrl)}` });
  return [...new Map(paths.map(entry => [entry.path, entry])).values()];
}

export function sitemapIds(count: number) {
  const parts = Math.ceil(count / SITEMAP_ENTRIES_PER_SHARD);
  return i18n.locales.flatMap(lang => Array.from({ length: parts }, (_, part) => ({ id: `${lang}-${part}` })));
}

export function parseSitemapId(id: string): { lang: Locale; part: number } | undefined {
  const match = /^([a-z]{2,3})-(0|[1-9]\d{0,5})$/.exec(id);
  if (!match || !i18n.locales.some(lang => lang === match[1])) return undefined;
  return { lang: match[1] as Locale, part: Number(match[2]) };
}

export function sitemapEntries(paths: SitemapPath[], lang: Locale, part: number): MetadataRoute.Sitemap {
  return paths.slice(part * SITEMAP_ENTRIES_PER_SHARD, (part + 1) * SITEMAP_ENTRIES_PER_SHARD).map(entry => ({
    url: absoluteSiteUrl(`${lang}${entry.path ? `/${entry.path}` : ''}`),
    lastModified: entry.lastModified,
    alternates: { languages: localizedPageAlternates(entry.path) },
  }));
}

const escapeXml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[character]!);

export function sitemapIndex(ids: { id: string }[]) {
  return '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + ids.map(({ id }) => `<sitemap><loc>${escapeXml(absoluteSiteUrl(`sitemaps/sitemap/${id}.xml`))}</loc></sitemap>`).join('\n')
    + '\n</sitemapindex>\n';
}
