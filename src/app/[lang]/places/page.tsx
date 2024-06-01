import React, { useState, useEffect, Suspense, lazy } from "react";
import getAllPlaces from "@/lib/getAllPlaces";
import styles from './page.module.css'
import { Metadata } from 'next'
import PlaceListItem from "./components/PlaceListItem";
import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/lib/i18n.config'
import { LoadMore } from "./load-more";
import LoadingSpinner from "../Components/LoadingSpinner";
import Meta from "./meta";
// import MustSee from "./must-see";

export default async function Places({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
    const { page } = await getDictionary(lang)
    const data: Promise<[PlaceAlias]> = getAllPlaces(lang)
    const places = await data
    // const arrayImages = placesData.places.map((place) => place.image)
    // const images = getBlurredDataUrls(arrayImages)
    const content = places.map(async (place, i) => {
      return (
          <PlaceListItem key={i} place={place} lang={lang}/>
      )
    })
    return (
        <div className={styles.main}>
          {/* <Head></Head> */}
          <Meta lang={lang} places={places} page={page}/>
            <h1>{page.sights.title}</h1>
            <h2>{page.sights.description}</h2>
            {/* <p>{page.sights.description}</p> */}
            <div className={styles.placesDiv}>
              <div className={styles.placesList}>
                  <Suspense fallback={
                    <div className={styles.loadingSpinnerWrapper}>
                      <LoadingSpinner text={page.loading} />
                    </div>}>
                    {content}
                    <LoadMore lang={lang}/>
                  </Suspense>
              </div>
            </div>
            {/* <MustSee lang={lang}/> */}
        </div>
    )
}

export async function generateMetadata({
  params: {lang}
}: {
  params: {lang : Locale}
}): Promise<Metadata> {
  const { page } = await getDictionary(lang)
  return {
      title: {
        absolute: page.sights.title
      },
      description: page.sights.description.substring(0, 160),
      keywords: page.sights.keywords,
      applicationName:"GuideBook of Kyrgyzstan",
      category: "Travel",
      openGraph: {
        title: page.sights.title,
        description: page.sights.description,
        url: `${process.env.NEXT_PUBLIC_URL}/places`,
        siteName: 'GuideBook of Kyrgyzstan',
        images: {
            url: `${process.env.NEXT_PUBLIC_URL}/uploads/kel-suu1.jpg`,
            secureUrl: `${process.env.NEXT_PUBLIC_URL}/uploads/kel-suu1.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
        },
        locale: page.langCode.replace("-",'_'),
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: page.sights.title,
        description: page.sights.description,
        siteId: "",
        creator: "@anvarinho",
        creatorId: "@anvarinho",
        images: {
            url: `${process.env.NEXT_PUBLIC_URL}/uploads/kel-suu1.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake",
            type:"image/jpeg"
        }
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
          url: `${process.env.NEXT_PUBLIC_URL}/places`,
          should_fallback: true,
        }
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_URL}/${lang}/places/`,
        languages: {
            "en-US": `${process.env.NEXT_PUBLIC_URL}/en/places/`,
            "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/places/`,
            "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/places/`,
            "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/places/`,
            "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/places/`,
            "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/places/`,
            "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/places/`,
            "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/places/`,
            "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/places/`,
            "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/places/`
        }
    },
  }
}