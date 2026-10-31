import getBase64 from '@/lib/getLocalBase64';
import { Locale } from "@/lib/i18n.config";
import { getDictionary } from '@/lib/dictionary'
import { formatTourDuration } from '@/lib/formatTourDuration';
import TourCard from './TourCard';

type Props = {
    tour: Tour,
    lang: Locale,
    featured?: boolean,
    order?: number,
}

export default async function TourListItem({ tour, lang, featured, order }: Props) {
  const { page } = await getDictionary(lang)
  return (
    <TourCard blurDataURL={getBase64(tour.images[0])} tour={tour} lang={lang} featured={featured} order={order}
      duration={formatTourDuration(tour.daysCount, lang)} fromLabel={page.tours.tourPage.from}/>
  )
}
