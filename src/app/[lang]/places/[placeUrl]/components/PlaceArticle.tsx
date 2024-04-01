import styles from "../page.module.css"
import Image from "next/image";
import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
// import { getLangDescription, getLangTitle, getLangName } from "@/lib/getLang";
import { getDictionary } from "@/lib/dictionary";

// import Head from 'next/head';

type Props = {
    promise: Promise<Place>,
    lang: Locale
}

export default async function PlaceArticle({ promise, lang }: Props) {
    const { page } = await getDictionary(lang)
    const baseUrl = 'http://159.65.95.44/';
    const place = await promise
    const blurDataURL = await getBase64(baseUrl + place.images[0])
    const createdDate = place.created ? new Date(place.created) : null;
    // console.log(place)
    return (
        <article className={styles.main}>
            <h1>{place.name}</h1>
            <Image src={baseUrl + place.images[0]} alt={place.images[0]} width={600} height={400} placeholder="blur" blurDataURL={blurDataURL} priority/>
            {/* <img src={baseUrl + place.place.image} alt="" /> */}
            <h4>{place.title}</h4>
            <div className={styles.info}>
                <p>{page.info.created}{createdDate?.toLocaleDateString()}</p>
                <p>{page.info.seen}{Math.floor(place.viewCount)}</p>
            </div>
            
            <br />
            <p>{place.description}</p>
        </article>
    )
}
