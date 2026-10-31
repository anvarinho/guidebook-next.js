The website supports 50 languages using local JSON files.

- Main dictionaries: `src/dictionaries/<locale>.json`.
- Illustrated homepage, Manas story, and airport-transfer page: their existing `translations/` directories.
- Shared controls, forms, gallery labels, and service pages: `ui/`.
- Language tags, names, regions, and writing direction: `src/lib/localeMetadata.ts`.

The additional languages began as machine translations. An editorial pass across all 50 locales has since revised homepage and listing descriptions, cultural terms, headings, and core calls to action. The opening, lake, and closing descriptions were edited individually for each language, and confirmed word duplication was removed from the wider copy. Native-speaker review remains useful for long-form text. The website makes no translation-service requests.

Keep the brand **GuideBook of Kyrgyzstan** in English, including publisher credits. Its visible elements use `translate="no"`. Flag artwork uses a consistent flat style with a white outline; static image imports ensure refreshed artwork receives new asset URLs.

The database and content API support all 50 locales. `contentLocale()` requests the selected website locale directly, using the same database keys (including `jp`, `kr`, `ae`, `cn`, `kz`, and `kg`). Unknown locale codes fall back to English. `baseLocales` identifies the ten original static bundles; it does not limit API languages.

Keep navigation labels aligned with their destination pages. Public copy uses concise titles, city-specific capital labels, contextual tour-price labels, and translated language-picker controls. Avoid literal translations of ambiguous English words such as “capital,” “from,” “subject,” and “close.”

Run `node --import tsx --test tests/localization.test.ts` to check translation structure, language tags, placeholders, and technical URLs.
