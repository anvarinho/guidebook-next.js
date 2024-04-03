import styles from '../page.module.css'
import Link from "next/link";
import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";

import Image from "next/image";

type Props = {
    tour: Tour,
    lang: Locale,
}

export default async function TourListItem({ tour, lang }: Props) {
  const baseUrl = 'http://159.65.95.44/';
  const blurDataURL = await getBase64(baseUrl + tour.images[0])
  const shortDescription = tour.description.slice(0, 300);
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
        <div className={styles.meta}><h4>From: 340$</h4><h4>{tour.days.length} {tour.days.length == 1 ? "Day": "Days"}</h4></div>
        <div className={styles.content}>
            <h3>{tour.title}</h3>
            <p>{shortDescription} ...</p>
        </div>
    </Link>
  )
}