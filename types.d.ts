// API types are derived from the runtime schemas so they cannot drift apart.
type GeoLocation = { longitude: string; latitude: string };
type Place = import('zod').infer<typeof import('./src/lib/contentSchemas').placeSchema>;
type PlaceAlias = import('zod').infer<typeof import('./src/lib/contentSchemas').placeAliasSchema>;
type Tour = import('zod').infer<typeof import('./src/lib/contentSchemas').tourSchema>;
type TourInfo = import('zod').infer<typeof import('./src/lib/contentSchemas').tourInfoSchema>;
type Day = import('zod').infer<typeof import('./src/lib/contentSchemas').daySchema>;
type Article = import('zod').infer<typeof import('./src/lib/contentSchemas').articleSchema>;
type ArticleAlias = import('zod').infer<typeof import('./src/lib/contentSchemas').articleAliasSchema>;
type Paragraph = import('zod').infer<typeof import('./src/lib/contentSchemas').paragraphSchema>;
type Weather = import('zod').infer<typeof import('./src/lib/contentSchemas').weatherSchema>;
type Places = import('zod').infer<typeof import('./src/lib/contentSchemas').paginatedPlacesSchema>;
type TourData = { tour: TourInfo };
type Tours = { count: number; tours: TourData[] };
type Translations = Record<import('./src/lib/i18n.config').Locale, string>;
