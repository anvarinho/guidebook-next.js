'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trafficSourceQuery } from '@/lib/trafficSource';

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
        // The traffic source is sent once per visit: the browser keeps reporting the
        // original referrer during in-site navigation, which would repeat it.
        let query = '';
        try {
          if (!sessionStorage.getItem('gb_src')) {
            sessionStorage.setItem('gb_src', '1');
            query = trafficSourceQuery(document.referrer, location.hostname, location.search);
          }
        } catch { /* storage blocked: skip the source rather than repeat it */ }
        const url = '/rum' + query;
        if (!navigator.sendBeacon?.(url)) fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
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
