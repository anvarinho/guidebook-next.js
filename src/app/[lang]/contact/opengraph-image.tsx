import { ogContentType, ogSize, renderOgCard } from '@/lib/ogImage';

export const alt = 'Contact GuideBook of Kyrgyzstan';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgCard({ eyebrow: 'Contact', title: 'Plan your trip to Kyrgyzstan', detail: 'Tell us where you want to go' });
}
