import getPlace from "@/lib/getPlace"
import getAllPlaces from "@/lib/getAllPlaces"
import { Suspense } from "react"
import PlaceArticle from "./components/PlaceArticle"
import styles from './page.module.css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import { getLangKeywords , getLangDescription, getLangName, getLangTitle } from "@/lib/getLang"

type Params = {
    params: {
        placeUrl: string,
        name: string,
        lang: Locale
    }
}

export default async function PlacePage({ params: {placeUrl, lang}}: Params) {
    const placeData: Promise<PlaceData> = getPlace(placeUrl)
    // const userData: Promise<Data> = getAllPlaces()
    // // const [place, places] = await Promise.all([placeData, userData])
    const data = await placeData
    const { page } = await getDictionary(lang)
    if (!data) notFound()

    return (
        <>  
            <Suspense fallback={<h3 className={styles.loading}>{page.loading}</h3>}>
                <PlaceArticle promise={placeData} lang={lang}/>
            </Suspense>
        </>
    )
}

export async function generateStaticParams(){
    const data: Promise<Places> = getAllPlaces()
    const placesData = await data
    return placesData.places.map( placeItem => ({
        placeUrl: placeItem.place.url,
        name: placeItem.place.name
    }))
}

export async function generateMetadata({
    params: { lang, placeUrl }
  }: {
    params: { lang: Locale; placeUrl: string }
  }): Promise<Metadata> {
    const { page } = await getDictionary(lang)
    const placeData: Promise<PlaceData> = getPlace(placeUrl)
    const data = await placeData
    // console.log(data)
    const description = data.place.description.ru.slice(0, 500)
    // console.log("generateMetadata")
    if (!data){
        return {
            title: "Place Not found"
        }
    }
    return {
        title: {
            absolute: getLangName(lang, data.place) + ' | ' + page.name
        },
        description: getLangDescription(lang, data.place),
        keywords: getLangKeywords(lang, data.place),
        openGraph: {
            images: `${data.place.image[0]}`,
        },
        alternates: {
            canonical: `en/places/${data.place.url}`,
            languages: {
                "en-EN": `en/places/${data.place.url}`,
                "fr-FR": `fr/places/${data.place.url}`,
                "de-DE": `de/places/${data.place.url}`,
                "es-ES": `es/places/${data.place.url}`,
                "ru-RU": `ru/places/${data.place.url}`
            }
        },
        twitter: {
            card: "summary_large_image",
            title: getLangTitle(lang, data.place),
            description: getLangDescription(lang, data.place),
            siteId: "",
            creator: "@anvarinho",
            creatorId: "@anvarinho",
            images: data.place.image
        },
        robots: {
            index: false,
            follow: false,
            nocache: true,
            googleBot: {
                index: true,
                follow: false,
            }
        }
    }
}