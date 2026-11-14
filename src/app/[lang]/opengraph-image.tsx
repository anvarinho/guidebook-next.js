import { ogContentType, ogSize, renderFallbackCard } from '@/lib/ogImage';

// Default social card for every page under /[lang] that has no card of its own
// (home, about, contact, ...). Places, tours and articles override it with their own.
export const alt = 'GuideBook of Kyrgyzstan';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderFallbackCard();
}
