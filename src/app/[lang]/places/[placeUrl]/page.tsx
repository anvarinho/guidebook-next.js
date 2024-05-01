import getPlace from "@/lib/getPlace"
import { Suspense } from "react"
import PlaceArticle from "./components/PlaceArticle"
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import LoadingSpinner from "../../Components/LoadingSpinner"
import Meta from "./meta"

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
                {/* <JsonLD data={metaData} /> */}
                <Meta lang={lang} place={data} page={page}/>
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
    const description = place.description.substring(0, 200)
    const images = place.images.map(image => ({
        url: `${process.env.NEXT_PUBLIC_URL}/${image}`,
        width: 800,
        height: 600,
        alt: `Image of ${place.name}`
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
        category: "Travel",
        openGraph: {
            title: place.title + ' | ' + page.name,
            description: description,
            url: `${process.env.NEXT_PUBLIC_URL}/${lang}/places/${place.url}`,
            siteName: 'GuideBook of Kyrgyzstan',
            images: images,
            locale: page.langCode.replace("-",'_'),
            type: 'website',
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_URL}/places/${place.url}`,
            languages: {
                "en-US": `${process.env.NEXT_PUBLIC_URL}/en/places/${place.url}`,
                "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/places/${place.url}`,
                "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/places/${place.url}`,
                "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/places/${place.url}`,
                "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/places/${place.url}`,
                "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/places/${place.url}`,
                "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/places/${place.url}`,
                "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/places/${place.url}`,
                "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/places/${place.url}`,
                "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/places/${place.url}`
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
        appLinks: {
            ios: {
              url: "https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810",
              app_store_id: "id1575382810",
              app_name: "GuideBook of Kyrgyzstan"
            },
            android: {
              url: "https://play.google.com/store/apps/details?id=com.anvarinho.guidebook",
              package: "com.anvarinho.guidebook",
              app_name: "GuideBook of Kyrgyzstan"
            },
            web: {
                url: `${process.env.NEXT_PUBLIC_URL}/${lang}/places/${place.url}`,
                should_fallback: true,
              }
        },
        robots: {
            index: true,
            follow: true,
            nocache: true,
            googleBot: {
                index: true,
                follow: true
            }
        }
    }
}