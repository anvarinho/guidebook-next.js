'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { imagePlaceholder } from '@/lib/imagePlaceholder';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n.config';
import { useReveal } from '../../places/components/useReveal';
import shared from '../../places/page.module.css';
import styles from '../page.module.css';

export default function TourCard({ tour, lang, blurDataURL, duration, fromLabel, featured = false, order = 0 }: {
  tour: Tour;
  lang: Locale;
  blurDataURL?: string;
  duration: string;
  fromLabel: string;
  featured?: boolean;
  order?: number;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useReveal(ref, order);

  return (
    <Link ref={ref} data-reveal-group href={`/${lang}/tours/${tour.url}`}
      className={`${shared.placeBox} ${styles.tourCard} ${featured ? shared.featuredCard : ''}`}>
      <div className={shared.placeMedia}>
        <div className={shared.imageFrame} data-reveal-image>
          <Image src={`${process.env.NEXT_PUBLIC_URL}/${tour.images[0]}`} alt={tour.title}
            className={shared.placeImg} width={640} height={420}
            sizes={featured ? `(max-width: 600px) calc(100vw - 32px), (max-width: 850px) ${order === 0 ? '94vw' : '46vw'}, (max-width: 1440px) ${order === 0 ? '60vw' : '38vw'}, ${order === 0 ? '835px' : '505px'}` : '(max-width: 600px) calc(100vw - 32px), (max-width: 991px) 46vw, (max-width: 1440px) 31vw, 440px'}
            {...imagePlaceholder(blurDataURL)} priority={featured && order === 0} loading={featured && order === 0 ? "eager" : "lazy"}/>
        </div>
        {featured && <span className={shared.cardNumber} aria-hidden="true">{String(order + 1).padStart(2, '0')}</span>}
        <span className={styles.duration}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>
          </svg>
          {duration}
        </span>
      </div>
      <div className={`${shared.placeContent} ${styles.content}`}>
        <div className={styles.titleRow}>
          <h2>{tour.title}</h2>
          <span className={shared.cardArrow} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12"/></svg>
          </span>
        </div>
        <p className={styles.summary}>{tour.description}</p>
        <p className={styles.price}><span>{fromLabel}</span><strong><bdi>${tour.lastPrice}</bdi></strong></p>
      </div>
    </Link>
  );
}
