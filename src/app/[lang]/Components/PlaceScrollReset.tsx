'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/** Preserve hash and browser history scroll positions while resetting new detail visits. */
export default function PlaceScrollReset() {
  const pathname = usePathname();
  const traversedPath = useRef<string | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    const markTraversal = () => { traversedPath.current = window.location.pathname; };
    window.addEventListener('popstate', markTraversal);
    return () => window.removeEventListener('popstate', markTraversal);
  }, []);

  useLayoutEffect(() => {
    const restoredPath = traversedPath.current === pathname;
    traversedPath.current = null;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (restoredPath || window.location.hash || !/^\/[a-z]{2,3}\/places\/[^/]+\/?$/i.test(pathname)) return;

    // Next.js owns route scrolling and browser history restoration. Keep this immediate
    // fallback for pushed detail routes without overriding a later Back/Forward restore.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}
