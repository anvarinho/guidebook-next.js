import styles from "../page.module.css"
import { getPlacesByURLs } from "@/lib/getAllPlaces"
import { GoogleMapsEmbed } from '@next/third-parties/google'
import { Locale } from "@/lib/i18n.config";
import { getDictionary } from "@/lib/dictionary";
import ImageSlider from "@/app/[lang]/Components/image/ImageSlider";
import Link from "next/link";

type Props = {
    promise: Promise<Place>,
    lang: Locale
}

export default async function PlaceArticle({ promise, lang }: Props) {
    const { page } = await getDictionary(lang)
    // const baseUrl = 'http://159.65.95.44/';
    const place = await promise
    // const blurDataURL = await getBase64(baseUrl + place.images[0])
    const sights = (place.sights && place.sights.length > 0) ? await getPlacesByURLs(lang, place.sights) : [];
    const createdDate = place.created ? new Date(place.created) : null;
    return (
        <article className={styles.main}>
            <h1>{place.name}</h1>
            <ImageSlider items={place.images}/>
            <h2>{place.title}</h2>
            <div className={styles.info}>
                <p>{page.info.created}{createdDate?.toLocaleDateString()}</p>
                <p>{page.info.seen}{Math.floor(place.viewCount)}</p>
            </div>
            <br />
            <p>{place.description}</p>
            <br />
            <GoogleMapsEmbed
                apiKey={`${process.env.GOOGLE_MAPS_API_KEY}`}
                height={300}
                width="100%"
                mode="place"
                q={`${place.location.latitude},${place.location.longitude}`}
                zoom="12"
                // q={`${place.url}, ${place.region}`}
                // center={`${place.location.latitude},${place.location.longitude}`}
                />
            
            {sights.length > 0 && (
                <div>
                    <br />
                    <h2>{place.name}: {page.sights.sights}</h2>
                </div>
            )}
            <br />
            {sights.map((sight: any, index: number) => {
                return (
                    <>
                        <ImageSlider items={sight.images}/>
                        <br />
                        <h4>{sight.title}</h4>
                        <br />
                        <p key={index}>{sight.description}...<Link href={`/${lang}/places/${sight.url}`} style={{'color':"var(--main-active-color)"}}> {page.home.button3}</Link></p>
                        <br />
                    </>
                );
            })}
        </article>
    )
}
