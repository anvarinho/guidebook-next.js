'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/** Counts a page view once the page has been visible for a moment (bots rarely get that far). */
export default function RealUserBeacon() {
  const pathname = usePathname();
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    let timer: number | undefined;
    const send = () => {
      if (sentFor.current === pathname) return;
      sentFor.current = pathname;
      try {
        if (!navigator.sendBeacon?.('/rum')) fetch('/rum', { method: 'POST', keepalive: true }).catch(() => {});
      } catch { /* counting must never break the page */ }
    };
    const whenVisible = () => { if (document.visibilityState === 'visible') send(); };
    if (sentFor.current !== pathname) {
      timer = window.setTimeout(() => {
        if (document.visibilityState === 'visible') send();
        else document.addEventListener('visibilitychange', whenVisible, { once: true });
      }, 1000);
    }
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', whenVisible);
    };
  }, [pathname]);

  return null;
}
