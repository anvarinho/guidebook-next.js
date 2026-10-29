import { getContent } from './contentApi';
import { articlesSchema } from './contentSchemas';

export { default as getArticle } from './getArticle';

export default function getAllArticles(lang: string) {
  return getContent('articles/', articlesSchema, { lang });
}

export async function sitemapArticles() {
  const articles = await getContent('articles', articlesSchema);
  return articles.map(article => ({ placeUrl: article.url, lastModified: article.createdAt }));
}
