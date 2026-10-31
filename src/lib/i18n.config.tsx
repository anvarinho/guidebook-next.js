// The original static bundles are kept separate from the additional bundles.
export const baseLocales = ["en","it","fr","de","es","jp","kr","ae","cn","ru"] as const;

export const i18n = {
    defaultLocale: 'en',
    locales: ["en","it","fr","de","es","jp","kr","ae","cn","ru","uz","kz","kg","tr","hi","ur","tg","ms","fa","az","uk","pl","nl","he","cs","pt","id","th","bn","ne","vi","ka","hy","mn","be","ro","sv","nb","da","fi","el","hr","sr","sk","sl","bg","bs","mk","sq","lt"]
} as const;

// The content API uses the same locale keys as the website and database.
export const contentLocales = i18n.locales;
export type Locale = (typeof i18n.locales)[number];
export type ContentLocale = (typeof contentLocales)[number];
export type AdditionalLocale = Exclude<Locale, (typeof baseLocales)[number]>;

export function contentLocale(locale: string): ContentLocale {
    return contentLocales.find(value => value === locale) ?? i18n.defaultLocale;
}
