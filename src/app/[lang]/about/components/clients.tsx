'use client'

import styles from './clients.module.css'
import { Locale } from '@/lib/i18n.config'
import { useState, useEffect } from 'react'
import getReviews from '@/lib/getReviews'
import Image from 'next/image'
import Link from 'next/link'
import { aboutContent } from '../content'
import { PlacesReveal } from '../../places/components/PlacesMotion'

interface Review {
  _id: string;
  name: string;
  avatar: string;
  review: string;
  rating: number;
}

const stars = (rating: number) => Math.max(0, Math.min(5, Math.round(rating || 0)))

export default function Clients({ params: { lang } }: { params: { lang: Locale } }) {
  const copy = aboutContent[lang]
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showItems, setShowItems] = useState(2)

  useEffect(() => {
    let active = true
    getReviews().then(data => {
      if (active) {
        setReviews(Array.isArray(data) ? data : [])
        setLoading(false)
      }
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)')
    const update = () => { setShowItems(media.matches ? 1 : 2) }
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const visibleReviews = Array.from({ length: Math.min(showItems, reviews.length) }, (_, slot) => reviews[(currentIndex + slot) % reviews.length])

  return (
    <section className={styles.testimonials} id="clients" aria-labelledby="reviews-heading">
      <PlacesReveal>
        <header className={styles.header}>
          <div><p className={styles.eyebrow}>03 / {copy.reviews}</p><h2 id="reviews-heading">{copy.reviews}</h2></div>
          {reviews.length > showItems && <div className={styles.controls}>
            <button type="button" aria-label={copy.previous} aria-controls="review-cards" onClick={() => setCurrentIndex(index => (index - showItems + reviews.length) % reviews.length)}><span aria-hidden="true">←</span></button>
            <button type="button" aria-label={copy.next} aria-controls="review-cards" onClick={() => setCurrentIndex(index => (index + showItems) % reviews.length)}><span aria-hidden="true">→</span></button>
          </div>}
        </header>
        <div className={styles.testimonials_container} id="review-cards" aria-busy={loading}>
          {loading ? <p className={styles.status} role="status">{copy.loading}</p> : reviews.length === 0 ? <Link href={`/${lang}/contact`} className={styles.status}>{copy.empty}<span aria-hidden="true"> ↗</span></Link> : visibleReviews.map((review, slot) => (
            <figure className={styles.testimonial_card} key={`${review._id}-${slot}`}>
              <span className={styles.quote} aria-hidden="true">“</span>
              <blockquote tabIndex={0} className={styles.reviewText} dir="auto"><p>{review.review}</p></blockquote>
              <figcaption className={styles.profile}>
                <div className={styles.profile_image}><Image src={review.avatar ? `https://central-asia.live/uploads/${review.avatar}` : '/avatar.jpg'} alt="" width={44} height={44}/></div>
                <span className={styles.profile_name} dir="auto">{review.name}</span>
                <span className={styles.ratings} aria-label={`${stars(review.rating)} / 5`}><span aria-hidden="true">{'★'.repeat(stars(review.rating))}</span></span>
              </figcaption>
            </figure>
          ))}
        </div>
        {reviews.length > showItems && <p className={styles.position} aria-live="polite" aria-atomic="true"><bdi>{currentIndex + 1} / {reviews.length}</bdi></p>}
      </PlacesReveal>
    </section>
  )
}
