import { getContent } from './contentApi';
import { tourInfoSchema } from './contentSchemas';

export default function getTour(slug: string, lang: string) {
  return getContent(`tours/${encodeURIComponent(slug)}`, tourInfoSchema, { lang }, true);
}
