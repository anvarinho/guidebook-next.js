import 'server-only';
import getPlacesWithWeather from './getPlacesWithWeather';

function hasTemperature(weather?: Weather | null): weather is Weather {
  return !!weather && Number.isFinite(Number.parseFloat(String(weather.temp ?? '')));
}

export default async function getPlaceWeather(url: string, lang: string, weather?: Weather | null): Promise<Weather | undefined> {
  // Detail responses can omit weather, so consult the same feed as the listing first.
  try {
    const places = await getPlacesWithWeather(lang);
    const stored = places.find(place => place.url === url)?.weather;
    if (hasTemperature(stored)) return stored;
  } catch {
    // Continue with detail data when the listing is unavailable.
  }
  if (hasTemperature(weather)) return weather;
  return undefined;
}
