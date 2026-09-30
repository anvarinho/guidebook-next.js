import type { CSSProperties } from "react";
import type { Locale } from '@/lib/i18n.config';
import getPlaceWeather from '@/lib/getPlaceWeather';
import WeatherIcon, { weatherIconCode, weatherAssetSource } from '../../../Components/weather/WeatherIcon';
import styles from '../page.module.css';

const labels: Record<Locale, string> = {
  en: 'Local weather', ru: 'Погода в этом месте', fr: 'Météo locale', de: 'Wetter vor Ort', es: 'Tiempo local',
  it: 'Meteo locale', jp: '現地の天気', kr: '현지 날씨', cn: '当地天气', ae: 'الطقس المحلي',
};

export default async function PlaceWeather({ url, lang, language, weather }: {
  url: string; lang: Locale; language: string; weather?: Weather | null;
}) {
  const conditions = await getPlaceWeather(url, lang, weather);
  const temperature = Number.parseFloat(String(conditions?.temp ?? ''));
  if (!conditions || !Number.isFinite(temperature)) return null;

  const icon = weatherIconCode(conditions.icon);
  const description = conditions.description || conditions.main;
  const formattedTemperature = new Intl.NumberFormat(language, { maximumFractionDigits: 0 })
    .format(Math.round(temperature) || 0);

  return (
    <section className={styles.weatherPanel} aria-label={labels[lang]} data-night={icon.endsWith('n')}
      data-condition={icon.slice(0, 2)} style={{ '--weather-art': `url("${weatherAssetSource(icon)}")` } as CSSProperties}>
      <div className={styles.weatherHeading}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M9 14.5V5a3 3 0 0 1 6 0v9.5a5 5 0 1 1-6 0Z"/><path d="M12 8v9"/><circle cx="12" cy="18" r="1.5" fill="currentColor" stroke="none"/>
        </svg>
        <span>{labels[lang]}</span>
      </div>
      <div className={styles.weatherConditions}>
        <bdi className={styles.weatherTemperature} dir="ltr">{formattedTemperature}<span>°C</span></bdi>
        <span className={styles.weatherIcon}><WeatherIcon icon={icon} size={88}/></span>
      </div>
      {description && <p className={styles.weatherDescription}>{description}</p>}
    </section>
  );
}
