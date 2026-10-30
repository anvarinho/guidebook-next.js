'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Native iframe lazy loading can start several screens away on mobile. */
export default function ViewportMap({ children }: { children: ReactNode }) {
  const container = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!container.current) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    observer.observe(container.current);
    return () => observer.disconnect();
  }, []);

  return <div ref={container} data-place-map style={{ minHeight: 'var(--place-map-height, 240px)' }}>{visible ? children : null}</div>;
}
