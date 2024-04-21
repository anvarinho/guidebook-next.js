import React, { Suspense } from "react";
import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import getAllTours from '@/lib/getAllTours'
import TourListItem from './components/TourListItem'
import LoadingSpinner from '../Components/LoadingSpinner'
import Meta from "./meta";

export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
    const { page } = await getDictionary(lang)
    const data: Promise<[Tour]> = getAllTours(lang)
    const toursData = await data

    const content = toursData.map(async (tour, i) => {
      return (
        <TourListItem key={i} tour={tour} lang={lang}/>
      )
    })
    
    return (
      <div className={styles.main}>
        <Meta lang={lang} tours={toursData} page={page} />
        <h1>{page.tours.title}</h1>
        <h2>{page.tours.description}</h2>
        <div className={styles.toursDiv}>
            <Suspense fallback={<LoadingSpinner text={page.loading}/>}>
              <div className={styles.toursList}>
              {content}
              <br />
              </div>
            </Suspense>
        </div>
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
      absolute: page.tours.title + ' | ' + page.name
    },
    description: page.tours.description,
    keywords: page.tours.keywords,
    applicationName:"GuideBook of Kyrgyzstan",
    category: "Travel",
      openGraph: {
        title: page.tours.title + ' | ' + 'GuideBook of Kyrgyzstan',
        description: page.tours.description,
        url: `${process.env.NEXT_PUBLIC_URL}/tours`,
        siteName: 'GuideBook of Kyrgyzstan',
        images: {
            url: `${process.env.NEXT_PUBLIC_URL}/uploads/kel-suu1.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
        },
        locale: page.langCode.replace("-",'_'),
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: page.tours.title,
        description: page.tours.description,
        siteId: "",
        creator: "@anvarinho",
        creatorId: "@anvarinho",
        images: {
            url: `${process.env.NEXT_PUBLIC_URL}/uploads/kel-suu1.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
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
          url: `${process.env.NEXT_PUBLIC_URL}/tours`,
          should_fallback: false,
        }
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_URL}/tours/`,
        languages: {
            "en-US": `${process.env.NEXT_PUBLIC_URL}/en/tours/`,
            "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/tours/`,
            "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/tours/`,
            "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/tours/`,
            "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/tours/`,
            "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/tours/`,
            "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/tours/`,
            "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/tours/`,
            "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/tours/`,
            "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/tours/`
        }
    },
  }
}