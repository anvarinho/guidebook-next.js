import { getContent } from './contentApi';

export default function getTour(slug: string, lang: string) {
  return getContent(`tours/${encodeURIComponent(slug)}`, { lang }, true);
}
