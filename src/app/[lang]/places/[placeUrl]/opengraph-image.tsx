import getPlace from '@/lib/getPlace';
import { ogContentType, ogSize, renderFallbackCard, renderOgCard } from '@/lib/ogImage';

export const alt = 'Place in Kyrgyzstan';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image(props: { params: Promise<{ placeUrl: string }> }) {
  const { placeUrl } = await props.params;
  const place = await getPlace(placeUrl, 'en');
  if (!place) return renderFallbackCard();
  return renderOgCard({ eyebrow: 'Place', title: place.name, detail: `${place.region}, Kyrgyzstan`, image: place.images[0] });
}
