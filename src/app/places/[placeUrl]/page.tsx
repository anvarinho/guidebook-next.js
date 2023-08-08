import getPlace from "@/lib/getPlace"
import getAllPlaces from "@/lib/getAllPlaces"
import { Suspense } from "react"
import Place from "./components/Place"
import styles from './page.module.css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Head from "next/head"

type Params = {
    params: {
        placeUrl: string
    }
}
export async function generateMetadata({params: {placeUrl}}: Params): Promise<Metadata> {
    const placeData: Promise<PlaceData> = getPlace(placeUrl)
    const data = await placeData
    if (!data){
        return {
            title: "Place Not found"
        }
    }
    return {
        title: data.place.name,
        description: data.place.description.split(`\n`)[0],
        keywords: data.place.keywords,
    }
}

export default async function PlacePage({ params: {placeUrl}}: Params) {
    const placeData: Promise<PlaceData> = getPlace(placeUrl)
    // const userData: Promise<Data> = getAllPlaces()
    // // const [place, places] = await Promise.all([placeData, userData])
    const data = await placeData
    // console.log(data)
    // console.log(generateStaticParams())

    if (!data) notFound()

    return (
        <>  
            <Head>
                <meta property="og:image" content={data.place.image[0]} />
            </Head>
            <Suspense fallback={<h3 className={styles.loading}>Loading...</h3>}>
                <Place promise={placeData}/>
            </Suspense>
        </>
    )
}

export async function generateStaticParams(){
    const data: Promise<Places> = getAllPlaces()
    const placesData = await data
    
    return placesData.places.map( placeItem => ({
        placeUrl: placeItem.place.url
    }))
}