import { getContent } from './contentApi';

export default function getPlace(slug: string, lang: string) {
  return getContent(`places/${encodeURIComponent(slug)}`, { lang }, true);
}
