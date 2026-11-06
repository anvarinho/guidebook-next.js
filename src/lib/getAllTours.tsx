import { getContent, getSitemapContent } from './contentApi';
import { toursSchema } from './contentSchemas';

export { default as getTour } from './getTour';

export default function getAllTours(lang: string) {
  return getContent('tours/', toursSchema, { lang });
}

export async function sitemapTours() {
  const tours = await getSitemapContent('tours/', toursSchema, { lang: 'en' });
  return tours.map(tour => ({ tourUrl: tour.url }));
}
