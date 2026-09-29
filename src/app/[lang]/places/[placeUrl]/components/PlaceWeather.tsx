import Image from 'next/image';
import type { Locale } from '@/lib/i18n.config';
import { getPlacesByURLs } from '@/lib/getAllPlaces';
import styles from '../page.module.css';

const labels: Record<Locale, string> = {
  en: 'Weather', ru: 'Погода', fr: 'Météo', de: 'Wetter', es: 'Tiempo',
  it: 'Meteo', jp: '天気', kr: '날씨', cn: '天气', ae: 'الطقس',
};

export default async function PlaceWeather({ url, lang, language, weather }: {
  url: string; lang: Locale; language: string; weather?: Weather | null;
}) {
  let conditions = weather;
  if (!Number.isFinite(Number.parseFloat(String(conditions?.temp ?? '')))) {
    // Detail responses may omit weather; reuse the listing's weather source.
    const places: PlaceAlias[] | undefined = await getPlacesByURLs(lang, [url]);
    conditions = Array.isArray(places) ? places.find(place => place.url === url)?.weather : undefined;
  }
  const temperature = Number.parseFloat(String(conditions?.temp ?? ''));
  if (!conditions || !Number.isFinite(temperature)) return null;

  const icon = /^(01|02|03|04|09|10|13|50)[dn]$/.test(conditions.icon) ? conditions.icon : null;
  const description = conditions.description || conditions.main;
  const formattedTemperature = new Intl.NumberFormat(language, {
    style: 'unit', unit: 'celsius', maximumFractionDigits: 0,
  }).format(Math.round(temperature) || 0);

  return (
    <div className={styles.weatherBadge}>
      {icon && <span className={styles.weatherIcon}><Image src={`/${icon}.png`} alt="" width={44} height={44}/></span>}
      <div className={styles.weatherCopy}>
        <span className={styles.weatherLabel}>{labels[lang]}</span>
        {description && <span className={styles.weatherDescription}>{description}</span>}
      </div>
      <bdi className={styles.weatherTemperature}>{formattedTemperature}</bdi>
    </div>
  );
}
