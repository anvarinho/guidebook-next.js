import styles from '../page.module.css'
import Link from "next/link";
import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
import { getDictionary } from "@/lib/dictionary";

import Image from "next/image";

type Props = {
  place: PlaceAlias,
  lang: Locale,
}

export default async function PlaceListItem({ place, lang }: Props) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const blurDataURL = await getBase64(baseUrl + place.images[0])
  return (
    <Link href={`places/${place.url}`} key={place._id} className={styles.placeBox}>
          <Image
              src={baseUrl + place.images[0]}
              alt={place.name}
              className={styles.placeImg}
              height={360}
              width={640}
              sizes='(max-width: 768px) 100%, (max-width: 1200px) 50%, 33%' 
              placeholder="blur" 
              blurDataURL={blurDataURL} 
              priority/>
        {place.weather && place.weather.temp &&(
          <div className={styles.weather}>
            <h4>{parseInt(place.weather?.temp)}°C</h4> 
            <Image src={`/${place.weather?.icon}.png`} alt={`${place.weather?.icon}`} width="32" height="32" /> 
          </div>
        )}
        <h3>{place.title}</h3>
        <h5>{place.region}</h5>
    </Link>
  )
}