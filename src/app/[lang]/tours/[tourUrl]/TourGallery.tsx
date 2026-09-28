import type { Locale } from '@/lib/i18n.config';
import getBase64 from '@/lib/getLocalBase64';
import PlaceGallery from '../../places/[placeUrl]/components/PlaceGallery';

export default async function TourGallery({ images, name, lang, priority = false }: {
  images: string[]; name: string; lang: Locale; priority?: boolean;
}) {
  if (!images.length) return null;
  const blurDataURL = await getBase64(`${process.env.NEXT_PUBLIC_URL}/${images[0]}`);
  return <PlaceGallery images={images} name={name} lang={lang} priority={priority} blurDataURL={blurDataURL}/>;
}
