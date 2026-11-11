'use client';

import labels from '@/translations/ui/section-navigation.json';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n.config';
import { sectionProgress, sectionStops } from './motion/progress';
import { onScrollFrame, pageTop, requestScrollFrame } from './motion/scroll';
import styles from './section-progress.module.css';

// A section is current once its top is this far below the top of the viewport (under the navbar).
const ANCHOR = 96;
// Sections that start (almost) level with the previous one sit beside it and get no line.
const MIN_OFFSET = 24;

type Section = { label: string; length: number; from: number; to: number };

function sectionLabel(element: HTMLElement) {
  const labelledBy = element.getAttribute('aria-labelledby');
  return element.dataset.sectionLabel
    || element.getAttribute('aria-label')
    || (labelledBy && document.getElementById(labelledBy)?.textContent)
    || element.querySelector('h2, h3')?.textContent
    || '';
}

/**
 * Reading position on detail pages: one line per [data-section], as long as its section is tall.
 * Sections are measured in the browser, and again whenever content or the window changes.
 */
export default function SectionProgress({ lang, dir }: { lang: Locale; dir: 'ltr' | 'rtl' }) {
  const pathname = usePathname();
  const [sections, setSections] = useState<Section[]>([]);
  const [active, setActive] = useState(-1);
  const rail = useRef<HTMLElement>(null);
  const stops = useRef<number[]>([]);
  const copy = labels[lang];

  useEffect(() => {
    let frame = 0;
    let signature = '';
    const measure = () => {
      frame = 0;
      const boxes: { top: number; bottom: number; label: string }[] = [];
      for (const element of document.querySelectorAll<HTMLElement>('[data-section]')) {
        if (!element.offsetParent) continue;
        const top = pageTop(element);
        if (boxes.length && top < boxes[boxes.length - 1].top + MIN_OFFSET) continue;
        boxes.push({ top, bottom: top + element.offsetHeight, label: sectionLabel(element).trim() });
      }
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      stops.current = sectionStops(boxes, ANCHOR, maxScroll, window.innerHeight);
      const next = boxes.map((box, index) => ({
        label: box.label,
        length: (boxes[index + 1]?.top ?? Math.max(...boxes.map(other => other.bottom))) - box.top,
        from: Math.round(stops.current[index]), to: Math.round(stops.current[index + 1]),
      }));
      const nextSignature = JSON.stringify(next);
      if (nextSignature !== signature) {
        signature = nextSignature;
        setSections(next);
      }
      requestScrollFrame();
    };
    const remeasure = () => { if (!frame) frame = requestAnimationFrame(measure); };

    measure();
    // Photos, fonts, streamed sections and "load more" results change section lengths.
    const resize = new ResizeObserver(remeasure);
    resize.observe(document.body);
    const mutations = new MutationObserver(remeasure);
    mutations.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', remeasure);

    const nativeTimeline = CSS.supports('animation-timeline: scroll()');
    const unsubscribe = onScrollFrame(scrollY => {
      const { index, progress } = sectionProgress(stops.current, scrollY);
      setActive(index);
      if (nativeTimeline) return;
      const fills = rail.current?.querySelectorAll<HTMLElement>('[data-fill]');
      fills?.forEach((fill, i) => fill.style.setProperty('--p', (progress[i] ?? 0).toFixed(3)));
    });

    return () => {
      unsubscribe();
      resize.disconnect();
      mutations.disconnect();
      window.removeEventListener('resize', remeasure);
      cancelAnimationFrame(frame);
    };
  }, [pathname]);

  if (sections.length < 2) return null;

  const go = (section: Section) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // One pixel past the stop, so the line that was clicked is the one that becomes current.
    window.scrollTo({ top: section.from + 1, behavior: reduced ? 'instant' : 'smooth' });
  };

  return (
    <nav ref={rail} className={styles.rail} aria-label={copy.sections} dir={dir}>
      {sections.map((section, index) => (
        <button type="button" key={index} onClick={() => go(section)}
          style={{ flexGrow: section.length, '--from': `${section.from}px`, '--to': `${section.to}px` } as CSSProperties}
          aria-label={copy.goTo.replace('{section}', section.label)} aria-current={index === active ? 'location' : undefined}>
          <span className={styles.line} aria-hidden="true"><span className={styles.fill} data-fill=""/></span>
          {section.label && <span className={styles.label} aria-hidden="true">{section.label}</span>}
        </button>
      ))}
    </nav>
  );
}
