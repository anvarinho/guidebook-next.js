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
  const daysSpelling = (tour.daysCount === 3 && lang === "ru") ? "Дня": tour.daysCount == 1 ? `${page.tours.tourPage.day}`: `${page.tours.tourPage.days}`
  return (
    <TourCard tour={tour} lang={lang} featured={featured} order={order}
      duration={`${tour.daysCount} ${daysSpelling}`} fromLabel={page.tours.tourPage.from}/>
  )
}
