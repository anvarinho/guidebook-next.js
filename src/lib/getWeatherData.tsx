import 'server-only';

// Keep the existing provider credential as a compatibility fallback.
const apiKey = process.env.OPENWEATHER_API_KEY || "12203a39a3f20b2e3d59ff3a6f23714b";
const providerLanguages: Record<string, string> = { jp: 'ja', kr: 'kr', cn: 'zh_cn', ae: 'ar' };

export default async function getWeatherData(location: string | GeoLocation, lang = 'en') {
  const params = new URLSearchParams({ appid: apiKey, units: 'metric', lang: providerLanguages[lang] || lang });
  if (typeof location === 'string') {
    params.set('q', location);
  } else {
    const lat = Number(location.latitude), lon = Number(location.longitude);
    if (!location.latitude || !location.longitude || !Number.isFinite(lat) || !Number.isFinite(lon)
      || Math.abs(lat) > 90 || Math.abs(lon) > 180) return undefined;
    params.set('lat', String(lat));
    params.set('lon', String(lon));
  }
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`, {
      next: { revalidate: 300 }, signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return undefined;
    return await response.json();
  } catch {
    // A weather outage must not prevent the place article or map from rendering.
    return undefined;
  }
}

export async function getCoordinateWeather(location: GeoLocation, lang: string): Promise<Weather | undefined> {
  const data = await getWeatherData(location, lang);
  const condition = data?.weather?.[0];
  if (!Number.isFinite(data?.main?.temp) || !condition) return undefined;
  return {
    temp: String(data.main.temp), main: condition.main, description: condition.description,
    icon: condition.icon,
  };
}
