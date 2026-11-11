'use client';
import additionalLabels from '@/translations/ui/app-lang-places-placeUrl-components-PlaceGallery-tsx-labels.json';
import ArrowIcon from '@/components/ArrowIcon';
import { useCallback, useEffect, useRef, useState, type PointerEvent, type SyntheticEvent } from 'react';
import Image from 'next/image';
import { imagePlaceholder } from '@/lib/imagePlaceholder';
import type { Locale } from '@/lib/i18n.config';
import styles from '../page.module.css';

const labels = {
    ...additionalLabels,
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

type PendingPhoto = { index: number; token: number };

export default function PlaceGallery({ images, name, lang, priority = true, blurDataURLs = [], detail = false }: {
  images: string[]; name: string; lang: Locale; priority?: boolean; blurDataURLs?: string[]; detail?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<PendingPhoto | null>(null);
  const thumbnails = useRef<HTMLDivElement>(null);
  const thumbnailsMounted = useRef(false);
  const activeIndex = useRef(0);
  const requestedIndex = useRef<number | null>(null);
  const requestToken = useRef(0);
  const pointerStart = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const t = labels[lang];
  const imageUrl = useCallback((path: string) => `${process.env.NEXT_PUBLIC_URL}/${path}`, []);

  const selectPhoto = useCallback((target: number) => {
    if (target === activeIndex.current) {
      requestToken.current += 1;
      requestedIndex.current = null;
      setPending(null);
      return;
    }

    const token = ++requestToken.current;
    if (!detail) {
      activeIndex.current = target;
      setIndex(target);
      return;
    }
    // Detail galleries keep the current photo until the next one has loaded.
    requestedIndex.current = target;
    setPending({ index: target, token });
  }, [detail]);

  const commitLoadedPhoto = useCallback(async (event: SyntheticEvent<HTMLImageElement>, next: PendingPhoto) => {
    const image = event.currentTarget;
    try { await image.decode(); } catch { /* A loaded image with pixels remains usable if decode() rejects. */ }
    if (next.token !== requestToken.current || image.naturalWidth === 0) return;
    requestedIndex.current = null;
    setPending(null);
    activeIndex.current = next.index;
    setIndex(next.index);
  }, []);

  const failPendingPhoto = useCallback((next: PendingPhoto) => {
    if (next.token !== requestToken.current) return;
    requestedIndex.current = null;
    setPending(null);
  }, []);

  const move = useCallback((step: -1 | 1) => {
    if (images.length < 2) return;
    const base = requestedIndex.current ?? activeIndex.current;
    selectPhoto((base + step + images.length) % images.length);
  }, [images.length, selectPhoto]);

  useEffect(() => {
    // The first thumbnail starts in view; avoid a layout read during hydration.
    if (!thumbnailsMounted.current) {
      thumbnailsMounted.current = true;
      return;
    }
    const strip = thumbnails.current;
    const selected = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !selected) return;
    const stripBox = strip.getBoundingClientRect();
    const selectedBox = selected.getBoundingClientRect();
    if (selectedBox.left < stripBox.left) strip.scrollBy({ left: selectedBox.left - stripBox.left - 4 });
    else if (selectedBox.right > stripBox.right) strip.scrollBy({ left: selectedBox.right - stripBox.right + 4 });
  }, [index]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!detail || event.pointerType === 'mouse' || images.length < 2) return;
    pointerStart.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.25) move(dx < 0 ? 1 : -1);
  };

  if (!images.length) return null;

  const sizes = "(max-width: 600px) calc(100vw - 32px), (max-width: 991px) calc(100vw - 48px), (max-width: 1280px) calc(100vw - 80px), 1200px";

  return (
    <section className={styles.gallery} data-detail={detail || undefined}
      aria-label={`${name} — ${t[0]}`} dir="ltr"
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
      <div className={styles.galleryStage} role={detail ? 'group' : undefined}
        aria-label={detail ? t[0] : undefined}
        aria-busy={detail ? pending !== null : undefined}
        tabIndex={detail && images.length > 1 ? 0 : undefined}
        onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointerStart.current = null; }}>
        <div className={styles.galleryPhotoViewport}>
          <div className={styles.galleryPhoto} key={`photo-${index}`}>
            <Image src={imageUrl(images[index])} alt={`${name} — ${t[3]} ${index + 1}`}
              fill sizes={sizes} fetchPriority={priority && index === 0 ? 'high' : undefined}
              loading={detail || (priority && index === 0) ? 'eager' : 'lazy'}
              {...(detail && priority && index === 0 ? { placeholder: 'empty' as const } : imagePlaceholder(blurDataURLs[index]))} />
          </div>
          {pending && <div className={`${styles.galleryPhoto} ${styles.galleryPhotoPreload}`} key={`photo-${pending.index}`}>
            <Image src={imageUrl(images[pending.index])} alt="" aria-hidden
              fill sizes={sizes} loading="eager" {...imagePlaceholder(blurDataURLs[pending.index])}
              onLoad={event => { void commitLoadedPhoto(event, pending); }}
              onError={() => failPendingPhoto(pending)} />
          </div>}
        </div>
        {images.length > 1 && <>
          <button type="button" className={`${styles.galleryControl} ${styles.previous}`}
            onClick={() => move(-1)} aria-label={t[1]}>
            <span aria-hidden="true"><ArrowIcon direction="left"/></span>
          </button>
          <button type="button" className={`${styles.galleryControl} ${styles.next}`}
            onClick={() => move(1)} aria-label={t[2]}>
            <span aria-hidden="true"><ArrowIcon direction="right"/></span>
          </button>
          <span className={styles.galleryCounter} aria-live="polite" aria-atomic="true">{index + 1} / {images.length}</span>
        </>}
      </div>
      {images.length > 1 && <div ref={thumbnails} className={styles.thumbnails}>
        {images.map((image, i) => <button type="button" key={`${image}-${i}`}
          aria-label={`${t[3]} ${i + 1}`} aria-pressed={index === i} onClick={() => selectPhoto(i)}>
          <Image {...imagePlaceholder(blurDataURLs[i])} src={imageUrl(image)} alt="" fill sizes="(max-width: 600px) 72px, 88px" />
        </button>)}
      </div>}
    </section>
  );
}
