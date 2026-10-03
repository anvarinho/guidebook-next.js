import type { Locale } from '@/lib/i18n.config';
import PlaceGallery from '../../places/[placeUrl]/components/PlaceGallery';

export default function TourGallery({ images, name, lang, priority = false }: {
  images: string[]; name: string; lang: Locale; priority?: boolean;
}) {
  if (!images.length) return null;
  return <PlaceGallery images={images} name={name} lang={lang} priority={priority}/>;
}
