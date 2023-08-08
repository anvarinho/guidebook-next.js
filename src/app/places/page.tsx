import React, { useState, useEffect, Suspense, lazy } from "react";
import getAllPlaces from "@/lib/getAllPlaces";
import styles from './page.module.css'
import { Metadata } from 'next'
import Link from "next/link";

import Image from "next/image";
import getBase64 from "@/lib/getLocalBase64"
import getBlurredDataUrls from "@/lib/getBlurredDataUrls";

export const metadata: Metadata = {
  title: 'Places - Explore Kyrgyzstan',
  description: 'Discover amazing places in Kyrgyzstan. Explore the beauty of the country through its diverse landscapes and captivating destinations.',
  keywords: "Kyrgyzstan places, Kyrgyzstan travel, explore Kyrgyzstan, Kyrgyzstan destinations, Kyrgyzstan tourism, must-visit places in Kyrgyzstan, top attractions Kyrgyzstan, Kyrgyzstan landscapes, cultural sites Kyrgyzstan, natural wonders Kyrgyzstan, best places to visit in Kyrgyzstan"
}

export default async function Places() {
    const baseUrl = 'http://172.20.10.4:4000/';
    const data: Promise<Places> = getAllPlaces()
    const placesData = await data
    // const arrayImages = placesData.places.map((place) => place.image)
    // const images = getBlurredDataUrls(arrayImages)
    const content = placesData.places.map(async (place, i) => {
      const blurDataURL = await getBase64(baseUrl + place.place.image)
      // console.log(placesData)
      return (
        <div key={place.place._id} className={styles.placeBox}>
          <Link href={`places/${place.place.url}`}>
            <Image src={baseUrl + place.place.image} alt="{place.image}" width={200} height={200} className={styles.placeImg} placeholder="blur" blurDataURL={blurDataURL} priority/>
          </Link>
          <h4>{place.place.name}</h4>
          <h6>{place.place.region}</h6>
      </div>
      )
    })
    // console.log("Hello World!")
    return (
        <div className={styles.main}>
            {/* <h1>Places: {placesData.length}</h1> */}
            <h1>Places</h1>
            <div className={styles.placesDiv}>
              <div className={styles.placesList}>
                  <Suspense fallback={<h3 className={styles.loading}>Loading...</h3>}>
                    {content}
                    <br />
                  </Suspense>
              </div>
            </div>
        </div>    
    )
}