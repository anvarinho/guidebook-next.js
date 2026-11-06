import { getSitemapPaths } from '@/lib/sitemapContent';
import { sitemapIds, sitemapIndex } from '@/lib/sitemap';

export const revalidate = 3600;

export async function GET() {
  const paths = await getSitemapPaths();
  return new Response(sitemapIndex(sitemapIds(paths.length)), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
