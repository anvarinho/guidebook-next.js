import React, { useState, useEffect } from "react";
import getAllPlaces from "@/lib/getAllPlaces";
import styles from './page.module.css'
import { Metadata } from 'next'
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: 'Places - Explore Kyrgyzstan',
  description: 'Discover amazing places in Kyrgyzstan. Explore the beauty of the country through its diverse landscapes and captivating destinations.',
  keywords: "Kyrgyzstan places, Kyrgyzstan travel, explore Kyrgyzstan, Kyrgyzstan destinations, Kyrgyzstan tourism, must-visit places in Kyrgyzstan, top attractions Kyrgyzstan, Kyrgyzstan landscapes, cultural sites Kyrgyzstan, natural wonders Kyrgyzstan, best places to visit in Kyrgyzstan"
}

export default async function Places() {
    const baseUrl = 'http://127.0.0.1:4000/';
    const data: Promise<Data> = getAllPlaces()
    const placesData = await data
    console.log("Hello World")
    const content = placesData.places.map((place) => {
      // const imageUrl = baseUrl + place.place.image;
      return (
        <div key={place.place._id} className={styles.box}>
          <Link href={`places/${place.place._id}`}>
            <img className={styles.placeImg} src={baseUrl + place.place.image} alt={baseUrl + place.place.image} />
          </Link>
          <p>{place.place.name}</p>
      </div>
      )
    })
    console.log("Hello World!")
    return (
        <div className={styles.main}>
            {/* <h1>Places: {placesData.length}</h1> */}
            <h1>Places {placesData.places[0].name}</h1>
            <div className={styles.placesDiv}>
              <div className={styles.placesList}>
                  <Suspense fallback={<h3 className={styles.loading}>Loading...</h3>}>
                    {content}
                  </Suspense>
              </div>
            </div>
        </div>    
    )
}