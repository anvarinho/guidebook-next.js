"use client";
import React, { useState, useEffect } from "react";
import styles from './homeplaces.module.css'
import { Locale } from "@/lib/i18n.config";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ImageLoader from "../image/ImageLoader";
import Link from "next/link";
import {
    faArrowLeft,
    faArrowRight
  } from "@fortawesome/free-solid-svg-icons";

const HomePlaces: React.FC<{ lang: Locale }> = ({ lang }) => {
    const baseUrl = 'http://159.65.95.44/';
    const [currentSlide, setCurrentSlide] = useState(0);
    const [places, setPlaces] = useState<any[]>([]);
    
    const handleSlideLeft = () => {
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        }
    };
    
    const handleSlideRight = () => {
        if (currentSlide < places.length - 1) { // Adjusted condition for correct end behavior
            setCurrentSlide(currentSlide + 1);
        }
    };    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = `http://159.65.95.44/api/places/home?lang=${lang}`;
                try {
                  const res = await fetch(url);
                  if (!res.ok) {
                    throw new Error('Failed to fetch data');
                  }
                  const data = await res.json();
                  setPlaces(data)
                //   console.log(data)
                //   return data;
                } catch (error) {
                  console.error('Error:', error);
                  throw error; // Re-throw the error to handle it at the caller's level
                }
            // console.log(data)
            } catch (error) {
              console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);
    

    return (
        <div className={styles.placesSection} id="places">
            {places.length > 0 ? (
                places.slice(currentSlide, currentSlide + 12).map((place) => (
                    <div key={place._id} className={styles.slideImages}>
                        <Image fill src={baseUrl + place.images[0]} alt={'arrow down'} objectFit='cover'/>
                        {/* <ImageLoader image={place.images[0]}/> */}
                        <div className={styles.coverGradient}></div>
                        <div className={styles.blurGradient}></div>
                        <div className={styles.content}>
                            <h2>{place.name}</h2>
                            <p>{place.description} ...</p>
                            <div>
                                <Link href={`/${lang}/places/${place.url}`} className={styles.floatingButton}  target="_blank" rel="noopener noreferrer">Read More</Link>
                                <Link href={`/places`}  className={styles.floatingButton}  target="_blank" rel="noopener noreferrer">More Places</Link>
                            </div>
                        </div>
                    </div>
                    
                ))
            ) : (
                <div className={styles.readMore}>
                    <h1>Kyrgyzstan</h1>
                    <h4>Discover the unexplored beauty of Kyrgyzstan with our comprehensive Guidebook, your passport to an enchanting land of natural wonders, vibrant culture, and timeless traditions. This meticulously crafted guide is your trusted companion for an unforgettable expedition through this Central Asian gem.</h4>
                    <div>
                        <Link href={`/places`}  className={styles.floatingButton} >Places to Visit</Link>
                        <Link href={`/articles`}  className={styles.floatingButton} >Facts About Kyrgyzstan</Link>
                        <Link href={`/tours`}  className={styles.floatingButton} >Our Tours</Link>
                    </div>
                </div>
            )}

            {places.length > 0 && (
                <div className={styles.buttons}>
                    <button onClick={handleSlideLeft} disabled={currentSlide === 0}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <button onClick={handleSlideRight} disabled={currentSlide === places.length - 2}>
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            )}
        </div>
    );
    
};

export default HomePlaces;