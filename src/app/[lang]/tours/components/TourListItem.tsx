import styles from '../page.module.css'
import Link from "next/link";
import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
import { getDictionary } from '@/lib/dictionary'

import Image from "next/image";

type Props = {
    tour: Tour,
    lang: Locale,
}

export default async function TourListItem({ tour, lang }: Props) {
  const { page } = await getDictionary(lang)
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const blurDataURL = await getBase64(baseUrl + tour.images[0])
  const shortDescription = tour.description.slice(0, 300);
  const daysSpelling = (tour.daysCount === 3 && lang === "ru") ? "Дня": tour.daysCount == 1 ? `${page.tours.tourPage.day}`: `${page.tours.tourPage.days}`
  return (
    <Link href={`tours/${tour.url}`} className={styles.tourBox}>
        <Image
        fill
        src={baseUrl + tour.images[0]}
        alt={tour.url}
        objectFit='cover'
        placeholder="blur" 
        blurDataURL={blurDataURL}
        priority
        />
        <div className={styles.meta}><h4><span>{page.tours.tourPage.from}: </span>{tour.lastPrice}$</h4><h4>{tour.daysCount} {daysSpelling}</h4></div>
        <div className={styles.content}>
            <h2>{tour.title}</h2>
            <p>{shortDescription} ...</p>
        </div>
    </Link>
  )
}