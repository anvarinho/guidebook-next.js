import styles from '../page.module.css'
import Link from "next/link";
import getBase64 from "@/lib/getLocalBase64"

import Image from "next/image";

export default async function PlaceListItem(place: PlaceData) {
  const baseUrl = 'http://172.20.10.4:4000/';
  const blurDataURL = await getBase64(baseUrl + place.place.image[0])
  return (
    <div key={place.place._id} className={styles.placeBox}>
        <Link href={`places/${place.place.url}`}>
          <Image src={baseUrl + place.place.image[0]} alt="{place.image}" width={200} height={200} className={styles.placeImg} placeholder="blur" blurDataURL={blurDataURL} priority/>
        </Link>
        {place.place.weather && place.place.weather.temp &&(
          <div className={styles.weather}>
            <h3>{parseInt(place.place.weather?.temp)}°C</h3> 
            <Image src={`${place.place.weather?.icon}.png`} alt={`${place.place.weather?.icon}`} width="32" height="32" /> 
          </div>
        )}
        <h4>{place.place.name}</h4>
        <h6>{place.place.region}</h6>
    </div>
  )
}