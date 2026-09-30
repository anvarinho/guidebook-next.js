import 'server-only';
import { cache } from 'react';
import getAllPlaces from './getAllPlaces';

// Stored conditions are authoritative and shared with the place page.
export default cache(async function getPlacesWithWeather(lang: string): Promise<PlaceAlias[]> {
  return getAllPlaces(lang);
});
