import { getContent } from './contentApi';

export { default as getPlace } from './getPlace';

export default function getAllPlaces(lang: string) {
  return getContent<PlaceAlias[]>('places', { lang });
}

export function getPlacesByURLs(lang: string, urls: string[] | null) {
  if (!urls?.length) return Promise.resolve([]);
  return getContent<Place[]>('places/home', { lang, urls: urls.join(',') });
}

export function getPlacesByRegion(lang: string, region: string, url: string) {
  return getContent<Place[]>('places/region', { lang, region, url });
}

export async function sitemapPlaces() {
  const data = await getContent<Places>('places/more', { offset: '0', limit: '200' });
  return data.places.map(place => ({ placeUrl: place.url, lastModified: place.created }));
}

export function getHomePlaces(lang: string) {
  return getContent<PlaceAlias[]>('places/home', { lang });
}
