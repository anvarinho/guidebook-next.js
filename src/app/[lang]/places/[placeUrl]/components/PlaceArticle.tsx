import styles from "../page.module.css"
import Image from "next/image";
import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
import { getLangDescription, getLangTitle, getLangName } from "@/lib/getLang";
import { getDictionary } from "@/lib/dictionary";

// import Head from 'next/head';

type Props = {
    promise: Promise<PlaceData>,
    lang: Locale
}

export default async function PlaceArticle({ promise, lang }: Props) {
    const { page } = await getDictionary(lang)
    const baseUrl = 'http://127.0.0.1:4000/';
    const place = await promise
    const blurDataURL = await getBase64(baseUrl + place.place.image[0])
    const createdDate = place.place.created ? new Date(place.place.created) : null;
    // console.log(place)
    return (
        <article className={styles.main}>
            <h1>{getLangName(lang, place.place)}</h1>
            <Image src={baseUrl + place.place.image[0]} alt={place.place.image[0]} width={400} height={200} placeholder="blur" blurDataURL={blurDataURL} priority/>
            {/* <img src={baseUrl + place.place.image} alt="" /> */}
            <h4>{getLangTitle(lang, place.place)}</h4>
            <div className={styles.info}>
                <p>{page.info.created}{createdDate?.toLocaleDateString()}</p>
                <p>{page.info.seen}{Math.floor(place.place.viewCount)}</p>
            </div>
            
            <br />
            <p>{getLangDescription(lang, place.place)}</p>
        </article>
    )
}
