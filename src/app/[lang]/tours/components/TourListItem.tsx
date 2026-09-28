import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
import { getDictionary } from '@/lib/dictionary'
import TourCard from './TourCard';

type Props = {
    tour: Tour,
    lang: Locale,
    featured?: boolean,
    order?: number,
}

export default async function TourListItem({ tour, lang, featured, order }: Props) {
  const { page } = await getDictionary(lang)
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const blurDataURL = await getBase64(baseUrl + tour.images[0])
  const daysSpelling = (tour.daysCount === 3 && lang === "ru") ? "Дня": tour.daysCount == 1 ? `${page.tours.tourPage.day}`: `${page.tours.tourPage.days}`
  return (
    <TourCard tour={tour} lang={lang} blurDataURL={blurDataURL} featured={featured} order={order}
      duration={`${tour.daysCount} ${daysSpelling}`} fromLabel={page.tours.tourPage.from}/>
  )
}
