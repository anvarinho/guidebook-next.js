import { getContent } from './contentApi';

export { default as getTour } from './getTour';

export default function getAllTours(lang: string) {
  return getContent<Tour[]>('tours/', { lang });
}

export async function sitemapTours() {
  const tours = await getAllTours('en');
  return tours.map(tour => ({ tourUrl: tour.url }));
}
