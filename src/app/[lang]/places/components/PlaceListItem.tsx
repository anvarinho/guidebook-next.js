import styles from '../page.module.css'
import Link from "next/link";
import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
import { getLangName, getLangRegions } from "@/lib/getLang";
import { getDictionary } from "@/lib/dictionary";

import Image from "next/image";

type Props = {
  place: PlaceData,
  lang: Locale,
}

export default async function PlaceListItem({ place, lang }: Props) {
  const baseUrl = 'http://127.0.0.1:4000/';
  const blurDataURL = await getBase64(baseUrl + place.place.image[0])
  return (
    <div key={place.place._id} className={styles.placeBox}>
        <Link href={`places/${place.place.url}`}>
          <Image
              //  fill 
              src={baseUrl + place.place.image[0]}
              alt={place.place.name.en}
              className={styles.placeImg}
              height={360}
              width={640}
              //  sizes='(max-width: 768px) 100%, (max-width: 1200px) 50%, 33%' 
              placeholder="blur" 
              blurDataURL={blurDataURL} 
              priority/>
        </Link>
        {place.place.weather && place.place.weather.temp &&(
          <div className={styles.weather}>
            <h3>{parseInt(place.place.weather?.temp)}°C</h3> 
            <Image src={`/${place.place.weather?.icon}.png`} alt={`${place.place.weather?.icon}`} width="32" height="32" /> 
          </div>
        )}
        <h4>{getLangName(lang, place.place)}</h4>
        <h6>{getLangRegions(lang, place.place)}</h6>
    </div>
  )
}