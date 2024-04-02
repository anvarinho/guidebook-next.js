'use client'

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Locale, i18n } from "@/lib/i18n.config";
import styles from './page.module.css'
import Link from "next/link";
import Image from "next/image";
import getBase64 from "@/lib/getLocalBase64"
// import { getLangName, getLangRegions } from "@/lib/getLang";
import PlaceListItem from "./components/PlaceListItem";
import ImageLoader from "../Components/ImageLoader";

export function LoadMore({ lang }: { lang: Locale }) {
    const [places, setPlaces] = useState<PlaceAlias[]>([]);
    const [page, setPage] = useState(0);
    const { ref, inView } = useInView();
    const [isLoading, setIsLoading] = useState(false);
    const baseUrl = 'http://159.65.95.44/';
    // const blurDataURL = await getBase64(baseUrl + place.image[0])

    // const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const loadMorePlaces = async () => {
        // await delay(2000);
        setIsLoading(true)
        const nextPage = page + 1;
        const url = `http://159.65.95.44/api/places/more?lang=${lang}&offset=${nextPage * 12}&limit=12`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            
            // // Update places state with new places
            setPlaces((prevPlaces) => [...prevPlaces, ...data.places]);
            setPage(nextPage);
            setIsLoading(false)

            // Update places state with new places and blurDataUrl
            // setPlaces((prevPlaces) => {
            //     const updatedPlaces = data.places.map((place: PlaceAlias) => {
            //     const baseUrl = 'http://127.0.0.1:4000/'; // Replace with your base URL
            //     const blurDataURL = getBase64(baseUrl + place.image[0]); // Assuming image[0] contains the image URL
        
            //     // Add blurDataURL to the place object
            //     return { ...place, blurDataURL };
            //     });
        
            //     return [...prevPlaces, ...updatedPlaces];
            // });
        
            // setPage(nextPage);

        } catch (error) {
            console.error("Error fetching places:", error);
        }
    };

    useEffect(() => {
        if (inView) {
            loadMorePlaces();
            // console.log(places)
        }
    }, [inView]);

    return (
        <>
            {places.length !== 0 ? (
                places.map((place) => (
                    // <PlaceListItem key={place._id} place={place} lang={lang}/>
                    <Link className={styles.placeBox} key={place._id} href={`places/${place.url}`} target="_blank" rel="noopener noreferrer">
                    <Image
                        src={baseUrl + place.images[0]}
                        alt={place.name}
                        className={styles.placeImg}
                        height={360}
                        width={640}
                        priority/>
                        <h4>{place.title}</h4>
                        <h6>{place.region}</h6>
                    </Link>
                ))
            ) : (
                <></>
            )}
            {isLoading && places.length < 140 ? (
                <div className={styles.center}>
                    <div className={styles.ring}></div>
                    <span className={styles.loadingText}>Loading</span>
                </div>
            ):(
                <h5 ref={ref}>No more places yet...</h5>
            )}
        </>
    );
}

