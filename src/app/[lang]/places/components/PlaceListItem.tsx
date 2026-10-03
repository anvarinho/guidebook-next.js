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
    <PlaceCard place={place} lang={lang} priority={priority} featured={featured} order={order}/>
  )
}
