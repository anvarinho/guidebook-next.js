import { getContent } from './contentApi';
import { placeSchema } from './contentSchemas';
import { isValidContentSlug } from './contentSlug';

export default function getPlace(slug: string, lang: string) {
  if (!isValidContentSlug(slug)) return Promise.resolve(undefined);
  return getContent(`places/${encodeURIComponent(slug)}`, placeSchema, { lang }, true);
}
