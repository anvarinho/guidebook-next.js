import getTour from '@/lib/getTour';
import { ogContentType, ogSize, renderFallbackCard, renderOgCard } from '@/lib/ogImage';

export const alt = 'Tour in Kyrgyzstan';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image(props: { params: Promise<{ tourUrl: string }> }) {
  const { tourUrl } = await props.params;
  const tour = await getTour(tourUrl, 'en');
  if (!tour) return renderFallbackCard();
  const days = tour.days.length;
  return renderOgCard({ eyebrow: 'Tour', title: tour.title, detail: `${days} ${days === 1 ? 'day' : 'days'} in Kyrgyzstan`, image: tour.images[0] });
}
