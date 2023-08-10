import styles from "../page.module.css"
import Image from "next/image";
import getBase64 from "@/lib/getLocalBase64"
// import Head from 'next/head';

type Props = {
    promise: Promise<PlaceData>
}

export default async function PlaceArticle({ promise }: Props) {
    const baseUrl = 'http://172.20.10.4:4000/';
    const place = await promise
    const blurDataURL = await getBase64(baseUrl + place.place.image[0])
    return (
        <article className={styles.main}>
            <h1>{place.place.name}</h1>
            <Image src={baseUrl + place.place.image[0]} alt={place.place.image[0]} width={400} height={200} placeholder="blur" blurDataURL={blurDataURL} priority/>
            {/* <img src={baseUrl + place.place.image} alt="" /> */}
            <h4>{place.place.title}</h4>
            <br />
            <p>{place.place.description}</p>
        </article>
    )
}
