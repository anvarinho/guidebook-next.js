import type { MetadataRoute } from 'next';
import { i18n } from '@/lib/i18n.config';
import { sitemapPlaces } from '@/lib/getAllPlaces';
import { sitemapArticles } from '@/lib/getAllArticles';
import { sitemapTours } from '@/lib/getAllTours';
import { absoluteSiteUrl, localizedPageAlternates } from '@/lib/seo';
import { transferUpdated } from './[lang]/manas-airport-transfers/seo';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [places, articles, tours] = await Promise.all([
    sitemapPlaces(), sitemapArticles(), sitemapTours(),
  ]);
  const pages: MetadataRoute.Sitemap = [];
  const routes = ['', 'places', 'tours', 'about', 'articles', 'contact', 'manas', 'manas-airport-transfers'];
  const modified = (value: string | Date | undefined) => {
    if (!value) return undefined;
    const date = new Date(value instanceof Date ? value.getTime() : value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  };
  for (const lang of i18n.locales) {
    for (const route of routes) {
      pages.push({
        url: absoluteSiteUrl(`${lang}${route ? `/${route}` : ''}`),
        lastModified: route === 'manas-airport-transfers' ? transferUpdated : undefined,
        alternates: { languages: localizedPageAlternates(route) },
      });
    }
    for (const place of places) {
      const path = `places/${encodeURIComponent(place.placeUrl)}`;
      pages.push({ url: absoluteSiteUrl(`${lang}/${path}`), lastModified: modified(place.lastModified),
        alternates: { languages: localizedPageAlternates(path) } });
    }
    for (const article of articles) {
      const path = `articles/${encodeURIComponent(article.placeUrl)}`;
      pages.push({ url: absoluteSiteUrl(`${lang}/${path}`), lastModified: modified(article.lastModified),
        alternates: { languages: localizedPageAlternates(path) } });
    }
    for (const tour of tours) {
      const path = `tours/${encodeURIComponent(tour.tourUrl)}`;
      pages.push({ url: absoluteSiteUrl(`${lang}/${path}`),
        alternates: { languages: localizedPageAlternates(path) } });
    }
  }
  return pages;
}
