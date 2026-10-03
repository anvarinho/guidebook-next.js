import { getContent } from './contentApi';

export { default as getArticle } from './getArticle';

export default function getAllArticles(lang: string) {
  return getContent<Article[]>('articles/', { lang });
}

export async function sitemapArticles() {
  const articles = await getContent<Article[]>('articles');
  return articles.map(article => ({ placeUrl: article.url, lastModified: article.createdAt }));
}
