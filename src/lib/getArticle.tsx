import { getContent } from './contentApi';
import { articleSchema } from './contentSchemas';

export default function getArticle(slug: string, lang: string) {
  // Match the API's slug contract so malformed URLs become normal missing pages.
  if (slug.length > 200 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return Promise.resolve(undefined);
  }
  return getContent(`articles/${encodeURIComponent(slug)}`, articleSchema, { lang }, true);
}
