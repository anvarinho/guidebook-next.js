'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../page.module.css';

export default function ArticleReadingProgress({ bodyId }: { bodyId: string }) {
  const progress = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const body = document.getElementById(bodyId);
    const bar = progress.current;
    if (!body || !bar) return;

    let frame = 0;
    let geometryDirty = true;
    let start = 0;
    let amount = 1;
    const update = () => {
      frame = 0;
      const scrollTop = window.scrollY;
      if (geometryDirty) {
        const rect = body.getBoundingClientRect();
        const headerOffset = window.innerWidth <= 991 ? 72 : 76;
        start = scrollTop + rect.top - headerOffset;
        const end = scrollTop + rect.bottom - document.documentElement.clientHeight;
        amount = Math.max(1, end - start);
        geometryDirty = false;
      }
      const value = Math.min(1, Math.max(0, (scrollTop - start) / amount));
      bar.style.transform = `scaleX(${value})`;
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const measure = () => {
      geometryDirty = true;
      scheduleUpdate();
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(body);
    const article = body.closest('[data-place-page]');
    if (article) observer?.observe(article);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', measure);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [bodyId, pathname]);

  return <span ref={progress} className={styles.readingProgress} data-reading-progress aria-hidden="true" />;
}
