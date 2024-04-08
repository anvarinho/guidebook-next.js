import getPlace from "@/lib/getPlace"
import { Suspense } from "react"
import PlaceArticle from "./components/PlaceArticle"
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import LoadingSpinner from "../../Components/LoadingSpinner"

type Params = {
    params: {
        placeUrl: string,
        name: string,
        lang: Locale
    }
}

export default async function PlacePage({ params: {placeUrl, lang}}: Params) {
    const placeData: Promise<Place> = getPlace(placeUrl, lang)
    const data = await placeData
    const { page } = await getDictionary(lang)
    if (!data) notFound()

    return (
            <Suspense fallback={<LoadingSpinner text={page.loading}/>}>
                <PlaceArticle promise={placeData} lang={lang}/>  
            </Suspense>
    )
}

export async function generateMetadata({
    params: { lang, placeUrl }
  }: {
    params: { lang: Locale; placeUrl: string }
  }): Promise<Metadata> {
    const { page } = await getDictionary(lang)
    const placeData: Promise<Place> = getPlace(placeUrl, lang)
    const place = await placeData
    const description = place.description.substring(0, 150)
    const images = place.images.map(image => ({
        url: `${process.env.URL}/${image}`,
        width: 800,
        height: 600,
        alt: place.title
    }))

    if (!place){
        return {
            title: "Place Not found"
        }
    }
    return {
        title: {
            absolute: place.title + ' | ' + page.name
        },
        description: description,
        keywords: place.keywords,
        applicationName: 'GuideBook of Kyrgyzstan',
        openGraph: {
            title: place.title + ' | ' + page.name,
            description: description,
            url: `${process.env.URL}/`,
            siteName: 'GuideBook of Kyrgyzstan',
            images: images,
            locale: 'en_US',
            type: 'website',
        },
        alternates: {
            canonical: `en/places/${place.url}`,
            languages: {
                "en-EN": `en/places/${place.url}`,
                "fr-FR": `fr/places/${place.url}`,
                "de-DE": `de/places/${place.url}`,
                "es-ES": `es/places/${place.url}`,
                "ru-RU": `ru/places/${place.url}`,
                "it-IT": `it/places/${place.url}`,
                "jp-JP": `jp/places/${place.url}`,
                "kr-KR": `kr/places/${place.url}`,
                "ae-AE": `ae/places/${place.url}`,
                "zh-CN": `cn/places/${place.url}`
            }
        },
        twitter: {
            card: "summary_large_image",
            title: place.title,
            description: description,
            siteId: "",
            creator: "@anvarinho",
            creatorId: "@anvarinho",
            images: images
        },
        robots: {
            index: false,
            follow: false,
            nocache: true,
            googleBot: {
                index: true,
                follow: true,
            }
        }
    }
}