import type { Locale } from './i18n.config';
import { localeMetadata } from './localeMetadata';

export function formatTourDuration(days: number, locale: Locale): string {
  return new Intl.NumberFormat(localeMetadata[locale].languageTag, {
    style: 'unit',
    unit: 'day',
    unitDisplay: 'long',
  }).format(days);
}
