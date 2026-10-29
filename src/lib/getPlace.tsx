import { getContent } from './contentApi';
import { placeSchema } from './contentSchemas';

export default function getPlace(slug: string, lang: string) {
  return getContent(`places/${encodeURIComponent(slug)}`, placeSchema, { lang }, true);
}
