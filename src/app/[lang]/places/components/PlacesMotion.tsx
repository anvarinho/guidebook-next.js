'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useReveal } from './useReveal';

export function PlacesReveal({ children, className, order = 0 }: {
  children: ReactNode; className?: string; order?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, order);
  return <div ref={ref} className={className} data-reveal-group>{children}</div>;
}

/** Observe each rendered description block without adding layout wrappers. */
export function PlacesRevealContent({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, 0, true);
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Place detail routes should always open at their title, not a restored list offset. */
export function PlaceScrollReset() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (!/^\/[a-z]{2}\/places\/[^/]+\/?$/i.test(pathname)) return;
    const html = document.documentElement;
    const previousBehavior = html.style.scrollBehavior;
    const previousRestoration = window.history.scrollRestoration;
    html.style.scrollBehavior = 'auto';
    window.history.scrollRestoration = 'manual';
    const reset = () => window.scrollTo(0, 0);
    reset();
    const frame = window.requestAnimationFrame(reset);
    const secondFrame = window.requestAnimationFrame(() => window.requestAnimationFrame(reset));
    const timer = window.setTimeout(reset, 240);
    return () => {
      window.cancelAnimationFrame(frame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(timer);
      html.style.scrollBehavior = previousBehavior;
      window.history.scrollRestoration = previousRestoration;
    };
  }, [pathname]);
  return null;
}
