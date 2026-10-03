import getBase64 from '@/lib/getLocalBase64';
import { Locale } from "@/lib/i18n.config";
import PlaceCard from './PlaceCard';

type Props = {
  place: PlaceAlias,
  lang: Locale,
  priority?: boolean,
  featured?: boolean,
  order?: number,
}

export default function PlaceListItem({ place, lang, priority, featured, order }: Props) {
  return (
    <PlaceCard blurDataURL={getBase64(place.images[0])} place={place} lang={lang} priority={priority} featured={featured} order={order}/>
  )
}
