import styles from "../page.module.css"
import { getPlacesByURLs } from "@/lib/getAllPlaces"
import { getPlacesByRegion } from "@/lib/getAllPlaces"
import { GoogleMapsEmbed, YouTubeEmbed } from '@next/third-parties/google'
import { Locale } from "@/lib/i18n.config";
import { getDictionary } from "@/lib/dictionary";
import Link from "next/link";
import ImageRenderer from "@/app/[lang]/Components/image/ImageRenderer";
import ShareButtons from "@/app/[lang]/Components/ShareButtons";
import PlaceDescripiton from "./PlaceDescripiton";

type Props = {
    promise: Promise<Place>,
    lang: Locale
}

export default async function PlaceArticle({ promise, lang }: Props) {
    const { page } = await getDictionary(lang)
    // const baseUrl = 'http://159.65.95.44/';
    const place = await promise
    const placesByRegionData = getPlacesByRegion(lang, place.region, place.url)
    const places: any[] = await placesByRegionData
    // const blurDataURL = await getBase64(baseUrl + place.images[0])
    const sights = (place.sights && place.sights.length > 0) ? await getPlacesByURLs(lang, place.sights) : [];
    const createdDate = place.created ? new Date(place.created) : null;
    return (
        <article className={styles.main}>
            <h1>{place.name}</h1>
            <ImageRenderer images={place.images} priority/>
            <h2>{place.title}</h2>
            <div className={styles.info}>
                <time dateTime={createdDate?.toLocaleString()}>{page.info.created}{createdDate?.toLocaleDateString()}</time>
                <p>{page.info.seen}{Math.floor(place.viewCount)}</p>
            </div>
            <br />
            <PlaceDescripiton text={place.description} highlights={page.sights.highlights} name={place.name}/>
            <br />
            {/* <ShareButtons/> */}
            {place.videoID && (
                <>
                <div className={styles.video}>
                    <YouTubeEmbed videoid={place.videoID}
                        // height={400}
                        width={700}
                        params="controls=0" />
                </div>
                <br />
                </>
            )}
            
            <GoogleMapsEmbed
                aria-label={`Google Maps ${place.name}`}
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
                    <h3>{place.name}: {page.sights.sights}</h3>
                </div>
            )}
            <br />
            {sights.map((sight: any, index: number) => {
                return (
                    <>
                        <ImageRenderer images={sight.images} priority={false}/>
                        <br />
                        <h4>{sight.title}</h4>
                        <br />
                        <p key={index}><Link href={`/${lang}/places/${sight.url}`} style={{'color':"var(--main-active-color)"}}> {sight.description}... {page.home.button3}</Link></p>
                        <br />
                    </>
                );
            })}
            <div>
                {/* <br /> */}
                <h3>{place.region}: {page.sights.sights}</h3>
                <br />
            </div>
            {places.map((sight: any, index: number) => {
                return (
                    <>
                        <ImageRenderer images={sight.images} priority={false}/>
                        <br />
                        <h4>{sight.name}</h4>
                        <br />
                        <p key={index}><Link href={`/${lang}/places/${sight.url}`} style={{'color':"var(--main-active-color)"}}> {sight.title}...  {page.home.button3}</Link></p>
                        <br />
                    </>
                );
            })}
        </article>
    )
}
