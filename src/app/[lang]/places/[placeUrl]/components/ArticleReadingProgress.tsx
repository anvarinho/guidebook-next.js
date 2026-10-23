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
    const update = () => {
      frame = 0;
      const rect = body.getBoundingClientRect();
      const scrollTop = window.scrollY;
      const headerOffset = window.innerWidth <= 991 ? 72 : 76;
      const start = scrollTop + rect.top - headerOffset;
      const end = scrollTop + rect.bottom - document.documentElement.clientHeight;
      const amount = Math.max(1, end - start);
      const value = Math.min(1, Math.max(0, (scrollTop - start) / amount));
      bar.style.transform = `scaleX(${value})`;
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(scheduleUpdate);
    observer?.observe(body);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      observer?.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [bodyId, pathname]);

  return <span ref={progress} className={styles.readingProgress} aria-hidden="true" />;
}
