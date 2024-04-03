import React, { Suspense } from "react";
import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import getAllTours from '@/lib/getAllTours'
import Image from "next/image";
import getBase64 from "@/lib/getLocalBase64"
import TourListItem from './components/TourListItem'
import LoadingSpinner from '../Components/LoadingSpinner'


export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
    const { page } = await getDictionary(lang)
    const data: Promise<[Tour]> = getAllTours()
    const toursData = await data
    const baseUrl = 'http://159.65.95.44/';
    // const blurDataURL = await getBase64(baseUrl + place.images[0])
    // console.log(toursData)

    const content = toursData.map(async (tour, i) => {
      return (
        <TourListItem key={i} tour={tour} lang={lang}/>
      )
    })
    return (
      <div className={styles.main}>
        <h1>{page.tours.title}</h1>
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
  }
}