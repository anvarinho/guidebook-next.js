import React, { Suspense } from "react";
import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import getAllTours from '@/lib/getAllTours'
import Image from "next/image";
import TourListItem from './components/TourListItem'
import LoadingSpinner from '../Components/LoadingSpinner'
import JsonLD from "../Components/meta/JsonLD"


export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
    const { page } = await getDictionary(lang)
    const data: Promise<[Tour]> = getAllTours(lang)
    const toursData = await data
    const variants = toursData.map((tour) => {
      return {
        "@type": "Product",
        "sku": tour._id,
        // "gtin14": tour.gtin14,
        "image": tour.images,
        "name": tour.title,
        "description": tour.description,
        "offers": {
          "@type": "Offer",
          "url": tour.url,
          "priceCurrency": "USD",
          "price": tour.lastPrice,
          "availability": "https://schema.org/InStock",
        }
      };
    });
    const metadata = [
      {
        "@context": "https://schema.org/",
        "@type": "ProductGroup",
        "name": page.tours.title,
        "description": page.tours.description,
        "url": `${process.env.NEXT_PUBLIC_URL}/tours`,
        "brand": {
          "@type": "Brand",
          "name": "GuideBook of Kyrgyzstan"
        },
        "audience": {
          "@type": "PeopleAudience",
          "audienceType": "Tourists"
        },
        "productGroupID": "44E01",
        "hasVariant": variants
      }
    ]
    const content = toursData.map(async (tour, i) => {
      return (
        <TourListItem key={i} tour={tour} lang={lang}/>
      )
    })
    return (
      <div className={styles.main}>
        <JsonLD data={metadata} />
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