'use client'
import styles from './clients.module.css'
import { Locale } from '@/lib/i18n.config'
import { useState, useEffect, useLayoutEffect } from 'react'
import getReviews from '@/lib/getReviews'

interface Review {
    _id: string;
    name: string;
    avatar: string;
    review: string;
    rating: number;
}

export default function Clients({
    params: { lang }
  }: {
    params: { lang: Locale };
  }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showItems, setShowItems] = useState<number>(2);

    const whatClientsSayTranslations = {
      "en": "What Our Clients Say",
      "fr": "Témoignages",
      "de": "Was unsere Kunden sagen",
      "es": "Lo que dicen nuestros clientes",
      "ae": "ما يقوله عملاؤنا",
      "kr": "고객들의 이야기",
      "jp": "お客様の声",
      "cn": "客户评价",
      "ru": "Что говорят наши клиенты",
      "it": "Cosa dicono i nostri clienti"
    };
  
    useEffect(() => {
      
      const interval = setInterval(() => {
        setCurrentIndex(prevIndex =>
          prevIndex === reviews.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
  
      return () => clearInterval(interval);
    }, [currentIndex]);

    useEffect(() => {
        const fetchData = async () => {
            try {
              const data = await getReviews();
              setReviews(data);
            } catch (error) {
              console.error('Error fetching reviews:', error);
            }
          };
      
          fetchData();
    },[])
  
    useLayoutEffect(() => {
      const handleResize = () => {
        if (window.innerWidth <= 900) {
          setShowItems(1);
        } else {
          setShowItems(2);
        }
      };
  
      handleResize();
  
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
  
    return (
      <section className={styles.testimonials} id="clients">
        <header>
          <h1>{whatClientsSayTranslations[lang]}</h1>
        </header>
        <div className={`${styles.testimonials_container}`}>
          {reviews !== undefined &&
            reviews.slice(currentIndex, currentIndex + showItems).map((review, index) => (
              <div className={`item ${styles.testimonial_card}`} key={index}>
                <main className={styles.test_card_body}>
                  <div className={styles.quote}>
                    <h2>
                      <span>{"\u201C"}</span>
                    </h2>
                  </div>
                  <p>{review.review}</p>
                  <div className={styles.ratings}>
                    {Array.from({ length: review.rating }, (_, i) => (
                      <span key={i}>&#x2605;</span>
                    ))}
                  </div>
                </main>
                <div className={styles.profile}>
                  <div className={styles.profile_image}>
                    <img
                      src={"https://central-asia.live/uploads/" + review.avatar}
                      alt="Profile"
                    />
                  </div>
                  <div className={styles.profile_desc}>
                    <span>{review.name}</span>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className={styles.slider_indicators}>
          {reviews.map((image, idx) => (
            <span
              key={idx}
              className={
                idx === currentIndex ? styles.active : styles.indicator
              }
            ></span>
          ))}
        </div>
      </section>
    );
}