'use client';

import { useRef, type ReactNode } from 'react';
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
