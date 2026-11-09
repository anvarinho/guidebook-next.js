import { getContent } from './contentApi';
import { tourInfoSchema } from './contentSchemas';
import { isValidContentSlug } from './contentSlug';

export default function getTour(slug: string, lang: string) {
  if (!isValidContentSlug(slug)) return Promise.resolve(undefined);
  return getContent(`tours/${encodeURIComponent(slug)}`, tourInfoSchema, { lang }, true);
}
