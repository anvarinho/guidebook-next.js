import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
import PlaceCard from './PlaceCard';

type Props = {
  place: PlaceAlias,
  lang: Locale,
  priority?: boolean,
  featured?: boolean,
  order?: number,
}

export default async function PlaceListItem({ place, lang, priority, featured, order }: Props) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const blurDataURL = await getBase64(baseUrl + place.images[0])
  return (
    <PlaceCard place={place} lang={lang} priority={priority} featured={featured} order={order} blurDataURL={blurDataURL}/>
  )
}
