import { getContent } from './contentApi';

export default function getArticle(slug: string, lang: string) {
  return getContent(`articles/${encodeURIComponent(slug)}`, { lang }, true);
}
