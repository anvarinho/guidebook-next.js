import { getContent } from './contentApi';
import { articleSchema } from './contentSchemas';
import { isValidContentSlug } from './contentSlug';

export default function getArticle(slug: string, lang: string) {
  // Match the API's slug contract so malformed URLs become normal missing pages.
  if (!isValidContentSlug(slug)) {
    return Promise.resolve(undefined);
  }
  return getContent(`articles/${encodeURIComponent(slug)}`, articleSchema, { lang }, true);
}
