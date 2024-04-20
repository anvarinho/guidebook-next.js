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
          <Meta places={places}/>
            <h1>{page.sights.title}</h1>
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
        absolute: page.sights.title + ' | ' + page.name
      },
      description: page.sights.description,
      keywords: page.sights.keywords,
      applicationName:"GuideBook of Kyrgyzstan",
      openGraph: {
        title: page.sights.title + ' | ' + 'GuideBook of Kyrgyzstan',
        description: page.sights.description,
        url: `${process.env.NEXT_PUBLIC_URL}/places`,
        siteName: 'GuideBook of Kyrgyzstan',
        images: {
            url: `${process.env.NEXT_PUBLIC_URL}/uploads/kel-suu1.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
        },
        locale: 'en_US',
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
            alt: "Kel-Suu Lake"
        }
    },
  }
}