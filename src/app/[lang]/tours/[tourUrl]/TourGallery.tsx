import getBlurredDataUrls from '@/lib/getBlurredDataUrls';
import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n.config';
import PlaceGallery from '../../places/[placeUrl]/components/PlaceGallery';

export default function TourGallery({ images, name, lang, priority = false, children }: {
  images: string[]; name: string; lang: Locale; priority?: boolean; children?: ReactNode;
}) {
  if (!images.length) return null;
  return <PlaceGallery blurDataURLs={getBlurredDataUrls(images)} images={images} name={name} lang={lang} priority={priority}>{children}</PlaceGallery>;
}
