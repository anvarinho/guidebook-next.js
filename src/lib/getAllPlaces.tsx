import { getContent } from './contentApi';
import { placesSchema, paginatedPlacesSchema } from './contentSchemas';

export { default as getPlace } from './getPlace';

export default function getAllPlaces(lang: string) {
  return getContent('places', placesSchema, { lang });
}

export function getPlacesByURLs(lang: string, urls: string[] | null) {
  if (!urls?.length) return Promise.resolve([]);
  return getContent('places/home', placesSchema, { lang, urls: urls.join(',') });
}

export function getPlacesByRegion(lang: string, region: string, url: string) {
  return getContent('places/region', placesSchema, { lang, region, url });
}

export async function sitemapPlaces() {
  const places: PlaceAlias[] = [];
  let offset = 0;

  // Keep the sitemap complete while respecting the API's per-request limit. The
  // same route may return fewer than 100 records, so advance by the actual page size.
  while (true) {
    const data = await getContent('places/more', paginatedPlacesSchema, {
      lang: 'en', offset: String(offset), limit: '100',
    });
    if (!data.places.length) break;
    places.push(...data.places);
    offset += data.places.length;
  }

  return places.map(place => ({ placeUrl: place.url, lastModified: place.created }));
}

export function getHomePlaces(lang: string) {
  return getContent('places/home', placesSchema, { lang });
}
