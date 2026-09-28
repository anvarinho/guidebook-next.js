'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Locale } from '@/lib/i18n.config';
import styles from '../page.module.css';

const labels = {
  en: ['Photo gallery', 'Previous photo', 'Next photo', 'Photo'],
  ru: ['Фотогалерея', 'Предыдущее фото', 'Следующее фото', 'Фото'],
  ae: ['معرض الصور', 'الصورة السابقة', 'الصورة التالية', 'صورة'],
  fr: ['Galerie photo', 'Photo précédente', 'Photo suivante', 'Photo'],
  de: ['Fotogalerie', 'Vorheriges Foto', 'Nächstes Foto', 'Foto'],
  it: ['Galleria fotografica', 'Foto precedente', 'Foto successiva', 'Foto'],
  es: ['Galería de fotos', 'Foto anterior', 'Foto siguiente', 'Foto'],
  jp: ['フォトギャラリー', '前の写真', '次の写真', '写真'],
  kr: ['사진 갤러리', '이전 사진', '다음 사진', '사진'],
  cn: ['照片图库', '上一张照片', '下一张照片', '照片'],
};

export default function PlaceGallery({ images, name, lang, priority = true, blurDataURL }: {
  images: string[]; name: string; lang: Locale; priority?: boolean; blurDataURL?: string;
}) {
  const [index, setIndex] = useState(0);
  const thumbnails = useRef<HTMLDivElement>(null);
  const t = labels[lang];
  const move = (step: number) => setIndex(current => (current + step + images.length) % images.length);
  const imageUrl = (path: string) => `${process.env.NEXT_PUBLIC_URL}/${path}`;
  useEffect(() => {
    const strip = thumbnails.current;
    const selected = strip?.children[index];
    if (!strip || !selected) return;
    const stripBox = strip.getBoundingClientRect();
    const selectedBox = selected.getBoundingClientRect();
    if (selectedBox.left < stripBox.left) strip.scrollLeft -= stripBox.left - selectedBox.left + 4;
    else if (selectedBox.right > stripBox.right) strip.scrollLeft += selectedBox.right - stripBox.right + 4;
  }, [index]);
  if (!images.length) return null;

  return (
    <section className={styles.gallery} aria-label={`${name} — ${t[0]}`} dir="ltr"
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
      <div className={styles.galleryStage}>
        <Image src={imageUrl(images[index])} alt={`${name} — ${t[3]} ${index + 1}`}
          fill sizes="(max-width: 1200px) 100vw, 1200px" priority={priority && index === 0}
          loading={priority && index === 0 ? 'eager' : 'lazy'}
          placeholder={index === 0 && blurDataURL ? 'blur' : 'empty'} blurDataURL={index === 0 ? blurDataURL : undefined} />
        {images.length > 1 && <>
          <button type="button" className={`${styles.galleryControl} ${styles.previous}`}
            onClick={() => move(-1)} aria-label={t[1]}><span aria-hidden="true">←</span></button>
          <button type="button" className={`${styles.galleryControl} ${styles.next}`}
            onClick={() => move(1)} aria-label={t[2]}><span aria-hidden="true">→</span></button>
          <span className={styles.galleryCounter} aria-live="polite" aria-atomic="true">
            {index + 1} / {images.length}
          </span>
        </>}
      </div>
      {images.length > 1 && <div ref={thumbnails} className={styles.thumbnails}>
        {images.map((image, i) => <button type="button" key={`${image}-${i}`}
          aria-label={`${t[3]} ${i + 1}`} aria-pressed={index === i} onClick={() => setIndex(i)}>
          <Image src={imageUrl(image)} alt="" fill sizes="88px" />
        </button>)}
      </div>}
    </section>
  );
}
