export const i18n = {
    defaultLocale: 'en',
    locales: ['en', 'it', 'fr', 'de', 'es', 'jp', 'kr', 'ae', 'cn', 'ru']
} as const

export type Locale = (typeof i18n)['locales'][number]