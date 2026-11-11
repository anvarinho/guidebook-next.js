'use client';

import labels from '@/translations/ui/section-navigation.json';
import { useEffect, useState, type CSSProperties } from 'react';
import type { Locale } from '@/lib/i18n.config';
import styles from './section-dots.module.css';

export type PageSection = { id: string; label: string };

/** Side navigation for long detail pages, modelled on the home page's section dots. */
export default function SectionDots({ sections, lang, dir }: { sections: PageSection[]; lang: Locale; dir: 'ltr' | 'rtl' }) {
  const [active, setActive] = useState(0);
  const copy = labels[lang];

  useEffect(() => {
    const elements = sections.map(section => document.getElementById(section.id));
    // A section is current while it crosses a line 40% down the viewport.
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(elements.indexOf(entry.target as HTMLElement));
      }
    }, { rootMargin: '-40% 0px -59% 0px' });
    elements.forEach(element => element && observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 3) return null;

  const go = (id: string) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
  };

  return (
    <nav className={styles.dots} aria-label={copy.sections} dir={dir} style={{ '--active': active } as CSSProperties}>
      <span className={styles.pill} aria-hidden="true"/>
      {sections.map((section, index) => (
        <button type="button" key={section.id} onClick={() => go(section.id)}
          aria-label={copy.goTo.replace('{section}', section.label)} aria-current={index === active ? 'location' : undefined}>
          <span className={styles.label} aria-hidden="true">{section.label}</span>
        </button>
      ))}
    </nav>
  );
}
