'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useReveal } from '../../places/components/useReveal';
import shared from '../../places/page.module.css';
import styles from '../articles.module.css';

type Props = {
  title: string; subtitle: string; href: string;
  imageUrl?: string; blurDataURL?: string;
  dateLabel?: string; dateTime?: string;
  views: string; viewsLabel: string;
  featured?: boolean; order?: number;
};

export default function ArticleCard({ title, subtitle, href, imageUrl, blurDataURL, dateLabel, dateTime, views, viewsLabel, featured = false, order = 0 }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  useReveal(ref, order);

  return (
    <Link ref={ref} data-reveal-group href={href} className={`${shared.placeBox} ${styles.articleCard} ${featured ? shared.featuredCard : ''}`}>
      <div className={shared.placeMedia}>
        <div className={`${shared.imageFrame} ${!imageUrl ? styles.noImage : ''}`} data-reveal-image>
          {imageUrl && <Image src={imageUrl} alt={title} className={shared.placeImg} width={640} height={420}
            sizes={featured ? '(max-width: 600px) 100vw, (max-width: 991px) 60vw, 65vw' : '(max-width: 600px) 100vw, (max-width: 991px) 50vw, 33vw'}
            placeholder={blurDataURL ? 'blur' : 'empty'} blurDataURL={blurDataURL} priority={featured && order === 0} loading={featured && order === 0 ? "eager" : "lazy"}/>}
        </div>
        {featured && <span className={shared.cardNumber} aria-hidden="true">{String(order + 1).padStart(2, '0')}</span>}
      </div>
      <div className={`${shared.placeContent} ${styles.content}`}>
        <div className={styles.titleRow}>
          <h2>{title}</h2>
          <span className={shared.cardArrow} aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12"/></svg></span>
        </div>
        {subtitle && <p className={styles.excerpt}>{subtitle}</p>}
        <div className={styles.cardMeta}>
          {dateLabel && <time dateTime={dateTime}>{dateLabel}</time>}
          <span className={styles.views}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span className={styles.srOnly}>{viewsLabel}: </span><bdi>{views}</bdi>
          </span>
        </div>
      </div>
    </Link>
  );
}
