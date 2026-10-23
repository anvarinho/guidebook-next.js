'use client';

import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useReveal } from './useReveal';

export function PlacesReveal({ children, className, order = 0, gallery = false }: {
  children: ReactNode; className?: string; order?: number; gallery?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, order);
  return <div ref={ref} className={className} data-reveal-group data-reveal-gallery={gallery || undefined}>{children}</div>;
}

/** Observe each rendered description block without adding layout wrappers. */
export function PlacesRevealContent({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, 0, true);
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Preserve hash and browser history scroll positions while resetting new detail visits. */
export function PlaceScrollReset() {
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
    if (restoredPath || window.location.hash || !/^\/[a-z]{2}\/places\/[^/]+\/?$/i.test(pathname)) return;

    // Next.js owns route scrolling and browser history restoration. Keep this immediate
    // fallback for pushed detail routes without overriding a later Back/Forward restore.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}
