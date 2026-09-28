'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n.config';
import styles from '../page.module.css';
import { useReveal } from './useReveal';

export default function PlaceCard({ place, lang, blurDataURL, priority = false, featured = false, order = 0 }: {
  place: Pick<PlaceAlias, 'url' | 'images' | 'name' | 'title' | 'region'> & { weather?: Weather | null };
  lang: Locale;
  blurDataURL?: string;
  priority?: boolean;
  featured?: boolean;
  order?: number;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  useReveal(cardRef, order);

  return (
    <Link ref={cardRef} href={`/${lang}/places/${place.url}`} className={`${styles.placeBox} ${featured ? styles.featuredCard : ''}`}>
      <div className={styles.placeMedia}>
        <div className={styles.imageFrame} data-reveal-image>
        <Image
          src={`${process.env.NEXT_PUBLIC_URL}/${place.images[0]}`}
          alt={place.name}
          className={styles.placeImg}
          height={360}
          width={640}
          sizes={featured ? `(max-width: 600px) calc(100vw - 32px), (max-width: 850px) ${order === 0 ? '94vw' : '46vw'}, (max-width: 1440px) ${order === 0 ? '60vw' : '38vw'}, ${order === 0 ? '835px' : '505px'}` : '(max-width: 600px) calc(100vw - 32px), (max-width: 991px) 46vw, (max-width: 1440px) 31vw, 440px'}
          placeholder={blurDataURL ? 'blur' : 'empty'}
          blurDataURL={blurDataURL}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
        />
        </div>
        {featured && <span className={styles.cardNumber} aria-hidden="true">{String(order + 1).padStart(2, '0')}</span>}
        {place.weather?.temp && (
          <span className={styles.weather}>
            <Image src={`/${place.weather.icon}.png`} alt="" width={28} height={28} />
            <span>{parseInt(place.weather.temp)}°C</span>
          </span>
        )}
      </div>
      <div className={styles.placeContent}>
        <div className={styles.placeDetails}>
          <p className={styles.region}>{place.region}</p>
          <h2>{place.title}</h2>
        </div>
        <span className={styles.cardArrow} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12"/></svg></span>
      </div>
    </Link>
  );
}
