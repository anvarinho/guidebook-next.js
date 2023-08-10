import getPlace from "@/lib/getPlace"
import getAllPlaces from "@/lib/getAllPlaces"
import { Suspense } from "react"
import PlaceArticle from "./components/PlaceArticle"
import styles from './page.module.css'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Params = {
    params: {
        placeUrl: string,
        name: string
    }
}

export default async function PlacePage({ params: {placeUrl}}: Params) {
    const placeData: Promise<PlaceData> = getPlace(placeUrl)
    // const userData: Promise<Data> = getAllPlaces()
    // // const [place, places] = await Promise.all([placeData, userData])
    const data = await placeData
    console.log(data.place._id)

    if (!data) notFound()

    return (
        <>  
            <Suspense fallback={<h3 className={styles.loading}>Loading...</h3>}>
                <PlaceArticle promise={placeData}/>
            </Suspense>
        </>
    )
}

export async function generateStaticParams(){
    const data: Promise<Places> = getAllPlaces()
    const placesData = await data
    return placesData.places.map( placeItem => ({
        placeUrl: placeItem.place.url,
        name: placeItem.place.name
    }))
}

export async function getPlaceData(placeUrl:string) {
    const placeData: Promise<PlaceData> = getPlace(placeUrl)
    const data = await placeData
    return data
}

export async function generateMetadata({params: {placeUrl}}: Params): Promise<Metadata> {
    const placeData: Promise<PlaceData> = getPlace(placeUrl)
    const data = await placeData
    const description = data.place.description.slice(0, 500)
    console.log("generateMetadata")
    if (!data){
        return {
            title: "Place Not found"
        }
    }
    return {
        title: data.place.name,
        description: description,
        keywords: data.place.keywords,
        openGraph: {
            images: `${data.place.image[0]}`,
        },
        alternates: {
            canonical: `/places/${data.place.url}`,
            languages: {
                "en-EN": `/places/${data.place.url}`,
            }
        },
        twitter: {
            card: "summary_large_image",
            title: data.place.name,
            description: description,
            siteId: "",
            creator: "@anvarinho",
            creatorId: "@anvarinho",
            images: data.place.image
        },
        robots: {
            index: false,
            follow: false,
            nocache: true,
            googleBot: {
                index: true,
                follow: false,
            }
        }
    }
}