'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/**
 * One observer for every [data-reveal] element and one scroll listener for the detail-page hero.
 * Runs only when the head script allowed motion (html[data-motion]); styles live in motion.css.
 */
export default function MotionController() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.motion) return;
    root.dataset.motion = 'live';

    const show = (element: Element, delay = 0) => {
      (element as HTMLElement).style.setProperty('--reveal-delay', `${delay}ms`);
      element.setAttribute('data-shown', '');
      observer.unobserve(element);
    };
    // The root extends far above the viewport, so content skipped by a fast jump also reveals.
    const observer = new IntersectionObserver(entries => {
      // Stagger what appears together, in reading order; reveal content above the viewport at once.
      const appearing = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
      let index = 0;
      for (const entry of appearing) show(entry.target, entry.boundingClientRect.bottom > 0 ? Math.min(index++, 5) * 90 : 0);
    }, { rootMargin: '100000px 0px -8% 0px' });

    let scan = 0;
    const observeAll = () => {
      scan = 0;
      document.querySelectorAll('[data-reveal]:not([data-shown])').forEach(element => observer.observe(element));
    };
    // Streamed sections and "load more" results arrive after the first scan.
    const mutations = new MutationObserver(() => { if (!scan) scan = requestAnimationFrame(observeAll); });
    mutations.observe(document.body, { childList: true, subtree: true });
    observeAll();

    const onFocus = (event: FocusEvent) => {
      const element = (event.target as Element | null)?.closest?.('[data-reveal]:not([data-shown])');
      if (element) show(element);
    };
    document.addEventListener('focusin', onFocus);

    const stopHero = heroMotion();
    return () => {
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(scan);
      document.removeEventListener('focusin', onFocus);
      stopHero();
    };
  }, [pathname]);

  return null;
}

/** Scroll-scrubbed hero: --hero-merge while the title meets the photo, --hero-cards while it is pinned. */
function heroMotion() {
  const track = document.querySelector<HTMLElement>('[data-hero-track]');
  const sticky = track?.querySelector<HTMLElement>('[data-hero-sticky]');
  const header = document.querySelector<HTMLElement>('[data-hero-header]');
  if (!track || !sticky) return () => {};

  let start = 1, travel = 1, frame = 0;
  const measure = () => {
    // Keep the photo's lower edge, where the cards land, inside short viewports.
    const top = Math.min(92, window.innerHeight - sticky.offsetHeight - 16);
    track.style.setProperty('--hero-sticky-top', `${top}px`);
    start = Math.max(1, track.getBoundingClientRect().top + window.scrollY - top);
    travel = Math.max(1, parseFloat(getComputedStyle(track, '::after').height) || 1);
    update();
  };
  const update = () => {
    frame = 0;
    const y = window.scrollY;
    const merge = clamp(y / start).toFixed(3);
    track.style.setProperty('--hero-merge', merge);
    track.style.setProperty('--hero-cards', clamp((y - start) / (travel * .85)).toFixed(3));
    header?.style.setProperty('--hero-merge', merge);
  };
  const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
  const resize = new ResizeObserver(measure);
  resize.observe(sticky);
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', measure);
  measure();
  return () => {
    resize.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', measure);
    cancelAnimationFrame(frame);
  };
}
