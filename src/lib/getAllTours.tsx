import { getContent } from './contentApi';
import { toursSchema } from './contentSchemas';

export { default as getTour } from './getTour';

export default function getAllTours(lang: string) {
  return getContent('tours/', toursSchema, { lang });
}

export async function sitemapTours() {
  const tours = await getAllTours('en');
  return tours.map(tour => ({ tourUrl: tour.url }));
}
