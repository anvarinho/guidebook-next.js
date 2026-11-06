import type { MetadataRoute } from 'next';
import { notFound } from 'next/navigation';
import { getSitemapPaths } from '@/lib/sitemapContent';
import { parseSitemapId, sitemapEntries, sitemapIds, SITEMAP_ENTRIES_PER_SHARD } from '@/lib/sitemap';

export const revalidate = 3600;

export async function generateSitemaps() {
  return sitemapIds((await getSitemapPaths()).length);
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const shard = parseSitemapId(await id);
  if (!shard) notFound();
  const paths = await getSitemapPaths();
  if (shard.part * SITEMAP_ENTRIES_PER_SHARD >= paths.length) notFound();
  return sitemapEntries(paths, shard.lang, shard.part);
}
