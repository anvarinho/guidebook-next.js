export const i18n = {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de', 'es', 'ru']
} as const

export type Locale = (typeof i18n)['locales'][number]