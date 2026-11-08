import media from './generated/article-media.json';

/** Article-specific media descriptions; preserve the legacy fallback elsewhere. */
export function articleImageAlt(image: string, locale: string, fallback: string): string {
  const descriptions = media as Record<string, Record<string, string>>;
  return descriptions[image.replace(/^\/+/, '')]?.[locale] || fallback;
}
