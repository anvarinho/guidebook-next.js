import { getContent } from './contentApi';
import { articleSchema } from './contentSchemas';

export default function getArticle(slug: string, lang: string) {
  return getContent(`articles/${encodeURIComponent(slug)}`, articleSchema, { lang }, true);
}
