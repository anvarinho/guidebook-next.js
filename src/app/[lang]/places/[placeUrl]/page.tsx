import getPlace from "@/lib/getPlace"
import { Suspense } from "react"
import PlaceArticle from "./components/PlaceArticle"
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import LoadingSpinner from "../../Components/LoadingSpinner"
import Meta from "./meta"
import { absoluteSiteUrl, localizedAlternates, metaDescription, siteUrl } from "@/lib/seo"

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
    if (!place) notFound()
    const pageUrl = absoluteSiteUrl(`${lang}/places/${encodeURIComponent(place.url)}`)
    const description = metaDescription(place.description)
    const images = place.images.slice(0, 4).map(image => ({
        url: absoluteSiteUrl(image),
        alt: `${place.name} in ${place.region}, Kyrgyzstan`,
    }))
    return {
        metadataBase: new URL(`${siteUrl}/`),
        title: place.title || `${place.name} in ${place.region}, Kyrgyzstan`,
        description,
        keywords: place.keywords,
        applicationName: 'GuideBook of Kyrgyzstan',
        category: "Travel",
        openGraph: {
            title: place.title,
            description: description,
            url: pageUrl,
            siteName: 'GuideBook of Kyrgyzstan',
            images: images,
            locale: page.langCode.replace("-", "_"),
            type: 'website',
        },
        alternates: {
            canonical: pageUrl,
            languages: localizedAlternates("places", place.url),
        },
        twitter: {
            card: "summary_large_image",
            title: place.title,
            description: description,
            creator: "@anvarinho",
            images: images.map(image => image.url),
        },
        robots: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
        }
    }
}
