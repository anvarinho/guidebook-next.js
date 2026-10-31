The website supports 50 languages using local JSON files.

- Main dictionaries: `src/dictionaries/<locale>.json`.
- Illustrated homepage, Manas story, and airport-transfer page: their existing `translations/` directories.
- Shared controls, forms, gallery labels, and service pages: `ui/`.
- Language tags, names, regions, and writing direction: `src/lib/localeMetadata.ts`.

The additional languages began as machine translations. An editorial pass across all 50 locales has since revised homepage and listing descriptions, cultural terms, headings, and core calls to action. The opening, lake, and closing descriptions were edited individually for each language, and confirmed word duplication was removed from the wider copy. Native-speaker review remains useful for long-form text. The website makes no translation-service requests.

Keep the brand **GuideBook of Kyrgyzstan** in English, including publisher credits. Its visible elements use `translate="no"`. Flag artwork uses a consistent flat style with a white outline; static image imports ensure refreshed artwork receives new asset URLs.

The database localization run populated content for all 50 locales. `contentLocale()` still requests the original API language for the existing ten locales and English for the forty additional locales. Enable the corresponding API locales before changing that compatibility mapping.

Keep navigation labels aligned with their destination pages. Public copy uses concise titles, city-specific capital labels, contextual tour-price labels, and translated language-picker controls. Avoid literal translations of ambiguous English words such as “capital,” “from,” “subject,” and “close.”

Run `node --import tsx --test tests/localization.test.ts` to check translation structure, language tags, placeholders, and technical URLs.
