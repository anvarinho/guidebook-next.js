import 'server-only';
import { sitemapPlaces } from './getAllPlaces';
import { sitemapArticles } from './getAllArticles';
import { sitemapTours } from './getAllTours';
import { sitemapPaths } from './sitemap';

export async function getSitemapPaths() {
  const [places, articles, tours] = await Promise.all([sitemapPlaces(), sitemapArticles(), sitemapTours()]);
  return sitemapPaths({ places, articles, tours });
}
