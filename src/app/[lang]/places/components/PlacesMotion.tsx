'use client';

import { useRef, type ReactNode } from 'react';
import { useReveal } from './useReveal';

export function PlacesReveal({ children, className, order = 0 }: {
  children: ReactNode; className?: string; order?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref, order);
  return <div ref={ref} className={className}>{children}</div>;
}
