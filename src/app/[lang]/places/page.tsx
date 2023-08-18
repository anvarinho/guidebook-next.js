import React, { useState, useEffect, Suspense, lazy } from "react";
import getAllPlaces from "@/lib/getAllPlaces";
import styles from './page.module.css'
import { Metadata } from 'next'
import PlaceListItem from "./components/PlaceListItem";
import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/lib/i18n.config'

export default async function Places({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
    const { page } = await getDictionary(lang)
    const baseUrl = 'http://172.20.10.4:4000/';
    const data: Promise<Places> = getAllPlaces()
    const placesData = await data
    // const arrayImages = placesData.places.map((place) => place.image)
    // const images = getBlurredDataUrls(arrayImages)
    const content = placesData.places.map(async (place, i) => {
      return (
          <PlaceListItem place={place} lang={lang}/>
      )
    })
    return (
        <div className={styles.main}>
            <h1>{page.sights.title}</h1>
            <div className={styles.placesDiv}>
              <div className={styles.placesList}>
                  <Suspense fallback={<h3 className={styles.loading}>{page.loading}</h3>}>
                    {content}
                    <br />
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
  }
}