import getPlace from "@/lib/getPlace"
import getAllPlaces from "@/lib/getAllPlaces"
import { Suspense } from "react"
import Place from "./components/Place"
import styles from './page.module.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Places - Explore Kyrgyzstan',
  description: 'Discover amazing places in Kyrgyzstan. Explore the beauty of the country through its diverse landscapes and captivating destinations.',
  keywords: "Kyrgyzstan places, Kyrgyzstan travel, explore Kyrgyzstan, Kyrgyzstan destinations, Kyrgyzstan tourism, must-visit places in Kyrgyzstan, top attractions Kyrgyzstan, Kyrgyzstan landscapes, cultural sites Kyrgyzstan, natural wonders Kyrgyzstan, best places to visit in Kyrgyzstan"
}


type Params = {
    params: {
        placeId: string
    }
}

export default async function PlacePage({ params: {placeId}}: Params) {
    const placeData: Promise<PlaceData> = getPlace(placeId)
    // const userData: Promise<Data> = getAllPlaces()
    // // const [place, places] = await Promise.all([placeData, userData])
    // const data = await placeData
    // console.log(data)
    return (
        <>  
            <Suspense fallback={<h3 className={styles.loading}>Loading...</h3>}>
                <Place promise={placeData}/>
            </Suspense>
        </>
    )
}