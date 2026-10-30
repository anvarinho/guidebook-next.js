'use client';

import ArrowIcon from '@/components/ArrowIcon';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type SyntheticEvent } from 'react';
import Image from 'next/image';
import { imagePlaceholder } from '@/lib/imagePlaceholder';
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

type PhotoSwap = { from: number; to: number; direction: -1 | 1; token: number; entered: boolean };
type PendingPhoto = { index: number; direction: -1 | 1; token: number };

export default function PlaceGallery({ images, name, lang, priority = true, blurDataURLs = [], detailMotion = false }: {
  images: string[]; name: string; lang: Locale; priority?: boolean; blurDataURLs?: string[]; detailMotion?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState<PendingPhoto | null>(null);
  const [swap, setSwap] = useState<PhotoSwap | null>(null);
  const gallery = useRef<HTMLElement>(null);
  const thumbnails = useRef<HTMLDivElement>(null);
  const thumbnailsMounted = useRef(false);
  const activeIndex = useRef(0);
  const requestedIndex = useRef<number | null>(null);
  const requestToken = useRef(0);
  const pointerStart = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const t = labels[lang];
  const imageUrl = useCallback((path: string) => `${process.env.NEXT_PUBLIC_URL}/${path}`, []);

  useEffect(() => {
    if (!detailMotion) return;
    const startScrollMotion = () => gallery.current?.setAttribute('data-gallery-scrolled', '');
    window.addEventListener('scroll', startScrollMotion, { passive: true, once: true });
    return () => window.removeEventListener('scroll', startScrollMotion);
  }, [detailMotion]);

  const selectPhoto = useCallback((target: number, direction: -1 | 1) => {
    if (target === activeIndex.current) {
      requestToken.current += 1;
      requestedIndex.current = null;
      setPending(null);
      return;
    }

    const token = ++requestToken.current;
    if (!detailMotion) {
      activeIndex.current = target;
      setIndex(target);
      return;
    }
    setSwap(null);
    requestedIndex.current = target;
    setPending({ index: target, direction, token });
  }, [detailMotion]);

  const commitLoadedPhoto = useCallback(async (event: SyntheticEvent<HTMLImageElement>, next: PendingPhoto) => {
    const image = event.currentTarget;
    try { await image.decode(); } catch { /* A loaded image with pixels remains usable if decode() rejects. */ }
    if (next.token !== requestToken.current || image.naturalWidth === 0) return;
    requestedIndex.current = null;
    setPending(null);

    const from = activeIndex.current;
    activeIndex.current = next.index;
    setIndex(next.index);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSwap(null);
      return;
    }
    setSwap({ from, to: next.index, direction: next.direction, token: next.token, entered: false });
  }, []);

  const failPendingPhoto = useCallback((next: PendingPhoto) => {
    if (next.token !== requestToken.current) return;
    requestedIndex.current = null;
    setPending(null);
  }, []);

  const move = useCallback((step: -1 | 1) => {
    if (images.length < 2) return;
    const base = requestedIndex.current ?? activeIndex.current;
    const target = (base + step + images.length) % images.length;
    const distance = (target - activeIndex.current + images.length) % images.length;
    void selectPhoto(target, distance <= images.length / 2 ? 1 : -1);
  }, [images.length, selectPhoto]);

  useLayoutEffect(() => {
    if (!swap || swap.entered) return;
    const frame = window.requestAnimationFrame(() => {
      setSwap(current => current?.token === swap.token ? { ...current, entered: true } : current);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [swap]);

  useEffect(() => {
    if (!swap) return;
    const token = swap.token;
    const timeout = window.setTimeout(() => {
      setSwap(current => current?.token === token ? null : current);
    }, 380);
    return () => window.clearTimeout(timeout);
  }, [swap]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const applyPreference = () => {
      if (media.matches) setSwap(null);
    };
    media.addEventListener('change', applyPreference);
    return () => media.removeEventListener('change', applyPreference);
  }, []);

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
    const behavior = !detailMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    if (selectedBox.left < stripBox.left) strip.scrollBy({ left: selectedBox.left - stripBox.left - 4, behavior });
    else if (selectedBox.right > stripBox.right) strip.scrollBy({ left: selectedBox.right - stripBox.right + 4, behavior });
  }, [detailMotion, index]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!detailMotion || event.pointerType === 'mouse' || images.length < 2) return;
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

  const photo = (photoIndex: number, key: string, onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void,
    onError?: () => void, preload = false) => (
    <Image key={key} src={imageUrl(images[photoIndex])}
      alt={preload ? '' : `${name} — ${t[3]} ${photoIndex + 1}`} aria-hidden={preload || undefined}
      fill sizes="(max-width: 1200px) 100vw, 1200px" fetchPriority={priority && photoIndex === 0 ? 'high' : undefined}
      loading={detailMotion || (priority && photoIndex === 0) ? 'eager' : 'lazy'}
      {...(detailMotion && priority && photoIndex === 0 ? { placeholder: 'empty' as const } : imagePlaceholder(blurDataURLs[photoIndex]))}
      onLoad={onLoad} onError={onError} />
  );

  return (
    <section ref={gallery} className={styles.gallery} data-place-detail-motion={detailMotion || undefined}
      aria-label={`${name} — ${t[0]}`} dir="ltr"
      onKeyDown={event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          move(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}>
      <div className={styles.galleryStage} role={detailMotion ? 'group' : undefined}
        aria-label={detailMotion ? t[0] : undefined}
        aria-busy={detailMotion ? pending !== null : undefined}
        tabIndex={detailMotion && images.length > 1 ? 0 : undefined}
        onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointerStart.current = null; }}>
        <div className={styles.galleryPhotoViewport}>
          {swap ? <>
            <div className={`${styles.galleryPhoto} ${styles.galleryPhotoOutgoing}`} data-direction={swap.direction} key={`photo-${swap.from}`}>
              {photo(swap.from, `photo-${swap.from}`)}
            </div>
            <div className={`${styles.galleryPhoto} ${styles.galleryPhotoIncoming} ${swap.entered ? styles.galleryPhotoEntered : ''}`}
              data-direction={swap.direction}
              key={`photo-${swap.to}`} onTransitionEnd={event => {
                if (event.target === event.currentTarget && event.propertyName === 'opacity') {
                  setSwap(current => current?.token === swap.token ? null : current);
                }
              }}>
              {photo(swap.to, `photo-${swap.to}`)}
            </div>
          </> : <>
            <div className={styles.galleryPhoto} key={`photo-${index}`}>
              {photo(index, `photo-${index}`)}
            </div>
            {detailMotion && pending && <div className={`${styles.galleryPhoto} ${styles.galleryPhotoPreload}`} data-direction={pending.direction}
              key={`photo-${pending.index}`}>
              <Image src={imageUrl(images[pending.index])} alt="" aria-hidden
                fill sizes="(max-width: 1200px) 100vw, 1200px"
                loading="eager" {...imagePlaceholder(blurDataURLs[pending.index])}
                onLoad={event => { void commitLoadedPhoto(event, pending); }}
                onError={() => failPendingPhoto(pending)} />
            </div>}
          </>}
        </div>
        {images.length > 1 && <>
          <button type="button" className={`${styles.galleryControl} ${styles.previous}`}
            onClick={() => move(-1)} aria-label={t[1]} data-gallery-control>
            <span aria-hidden="true"><ArrowIcon direction="left"/></span>
          </button>
          <button type="button" className={`${styles.galleryControl} ${styles.next}`}
            onClick={() => move(1)} aria-label={t[2]} data-gallery-control>
            <span aria-hidden="true"><ArrowIcon direction="right"/></span>
          </button>
          <span className={styles.galleryCounter} aria-live="polite" aria-atomic="true" data-gallery-control>
            <span key={index} className={styles.galleryCounterValue}>{index + 1} / {images.length}</span>
          </span>
        </>}
      </div>
      {images.length > 1 && <div ref={thumbnails} className={styles.thumbnails} data-gallery-thumbnails>
        {images.map((image, i) => <button type="button" key={`${image}-${i}`}
          aria-label={`${t[3]} ${i + 1}`} aria-pressed={index === i} onClick={() => {
            const distance = (i - activeIndex.current + images.length) % images.length;
            void selectPhoto(i, distance <= images.length / 2 ? 1 : -1);
          }}>
          <Image {...imagePlaceholder(blurDataURLs[i])} src={imageUrl(image)} alt="" fill sizes="(max-width: 600px) 72px, 88px" />
        </button>)}
      </div>}
    </section>
  );
}
