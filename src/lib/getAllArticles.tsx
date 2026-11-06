import { getContent, getSitemapContent } from './contentApi';
import { articlesSchema } from './contentSchemas';

export { default as getArticle } from './getArticle';

type Articles = ReturnType<typeof articlesSchema.parse>;

async function readAllArticles(fetchPage: (params: { offset: string; limit: string }) => Promise<Articles>) {
  const articles: Articles = [];
  // Advance by the returned size: the API may enforce a smaller page cap.
  // An empty page is the end marker, including for an exact page-size multiple.
  for (let offset = 0; offset <= 100_000;) {
    const page = await fetchPage({ offset: String(offset), limit: '100' });
    if (!page.length) return articles;
    articles.push(...page);
    offset += page.length;
  }
  throw new Error('Article pagination exceeded the supported offset range');
}

export default function getAllArticles(lang: string) {
  return readAllArticles(params => getContent('articles', articlesSchema, { lang, ...params }));
}

export async function sitemapArticles() {
  const articles = await readAllArticles(params => getSitemapContent('articles', articlesSchema, params));
  return articles.map(article => ({ placeUrl: article.url, lastModified: article.createdAt }));
}
