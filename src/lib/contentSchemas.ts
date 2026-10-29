import { z } from 'zod';

// Shapes verified against the public content API. Unknown fields are stripped:
// transport metadata and accidental private fields never propagate into props.
const text = z.string().max(500_000);
const slug = z.string().min(1).max(300);
const image = z.string().min(1).max(2048).refine(value => {
  if (/[\u0000-\u001f\\]/.test(value) || value.startsWith('//')) return false;
  return !/^[a-z][a-z\d+.-]*:/i.test(value) || /^https?:\/\//i.test(value);
}, 'Expected an image path or HTTP URL');
const images = z.array(image).min(1).max(200);
const date = z.string().refine(value => Number.isFinite(Date.parse(value)), 'Expected a date');
export const weatherSchema = z.object({
  temp: z.string(), main: z.string(), description: z.string(), icon: z.string(),
});
const locationSchema = z.object({ latitude: z.string(), longitude: z.string() });
export const placeAliasSchema = z.object({
  _id: z.string(), url: slug, name: text, title: text, region: text, images,
  created: date.optional(), weather: weatherSchema.nullish(), location: locationSchema.optional(),
  description: text.optional(),
});
export const placeSchema = placeAliasSchema.extend({
  description: text, keywords: text.optional().default(''), location: locationSchema,
  sights: z.array(slug).optional().default([]), viewCount: z.number().finite().nonnegative(),
  created: date.optional(), videoID: z.string().optional(),
});
export const placesSchema = z.array(placeAliasSchema);
// The region endpoint projects public summaries without MongoDB IDs.
export const regionalPlacesSchema = z.array(placeAliasSchema.omit({ _id: true }));
export const paginatedPlacesSchema = z.object({
  count: z.number().int().nonnegative(), places: placesSchema,
});
export const tourSchema = z.object({
  _id: z.string(), url: slug, title: text, description: text, images,
  daysCount: z.number().int().nonnegative(), lastPrice: z.number().finite().nonnegative(),
});
export const toursSchema = z.array(tourSchema);
export const daySchema = z.object({
  activities: z.array(text), images: z.array(image), places: z.array(slug),
});
export const tourInfoSchema = z.object({
  _id: z.string(), url: slug, title: text, description: text, images,
  level: text, price: z.array(z.number().finite().nonnegative()).min(1),
  viewCount: z.number().finite().nonnegative(), keywords: text.optional().default(''),
  created: date.optional(), days: z.array(daySchema).min(1),
  includings: z.array(text), excludings: z.array(text),
});
export const paragraphSchema = z.object({
  title: text.optional().default(''), text, image: image.optional(), link: z.string().optional(),
});
export const articleAliasSchema = z.object({
  _id: z.string().optional(), url: slug, title: text, subtitle: text,
  image: image.optional(), viewCount: z.number().finite().nonnegative(), createdAt: date,
  paragraphs: z.array(paragraphSchema).optional().default([]), keywords: text.optional().default(''),
});
export const articlesSchema = z.array(articleAliasSchema);
export const articleSchema = articleAliasSchema.extend({
  keywords: text.optional().default(''), paragraphs: z.array(paragraphSchema),
});
export const reviewsSchema = z.array(z.object({
  _id: z.string(), name: text, avatar: z.string(), review: text,
  rating: z.number().finite().min(0).max(5),
}));
