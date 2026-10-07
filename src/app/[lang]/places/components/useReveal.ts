'use client';

import { useEffect, type RefObject } from 'react';

/** Progressive enhancement: server-rendered content is visible without JavaScript. */
export function useReveal(ref: RefObject<HTMLElement | null>, order = 0, individual = false) {
  useEffect(() => {
    const root = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!root || reduced.matches || !('IntersectionObserver' in window)) return;

    const attach = (element: HTMLElement, index: number) => {

      // Enable coordinated copy and image entrances on the travel pages.
      const sleek = Boolean(element.closest('[data-page-motion]'));
      const hasGlassPanel = Boolean(element.querySelector('.placeContent'));
      const easing = sleek ? 'cubic-bezier(.22, 1, .36, 1)' : 'cubic-bezier(.16, 1, .3, 1)';
      let revealed = false;
      const animations: Animation[] = [];
      const reveal = (immediate = false) => {
        if (revealed) return;
        revealed = true;
        element.style.opacity = '';
        observer.disconnect();
        if (immediate || reduced.matches) return;
        const delay = window.innerWidth > 600 ? ((order + index) % 3) * (sleek ? 80 : 50) : 0;
        animations.push(element.animate(hasGlassPanel ? [
          { opacity: 0 },
          { opacity: 1 },
        ] : [
          { opacity: 0, transform: sleek ? 'translateY(12px)' : 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: sleek ? 800 : 900, delay, easing, fill: 'backwards' }));
        const owns = (node: Element) => !element.hasAttribute('data-reveal-group') || node.closest('[data-reveal-group]') === element;
        const media = Array.from(element.querySelectorAll(sleek ? '[data-reveal-image], img[alt]:not([alt=""])' : '[data-reveal-image]'))
          .filter(node => owns(node) && (node.hasAttribute('data-reveal-image') || !node.closest('[data-reveal-image]')));
        media.forEach(image => animations.push(image.animate(sleek ? [
          { opacity: 0, transform: 'scale(1.055)' },
          { opacity: 1, transform: 'scale(1.015)', offset: .5 },
          { opacity: 1, transform: 'scale(1)' },
        ] : [
          { transform: 'scale(1.025)' }, { transform: 'scale(1)' },
        ], { duration: sleek ? 1500 : 1200, delay, easing, fill: 'backwards' })));
        if (sleek) Array.from(element.querySelectorAll('[data-reveal-copy], h1, h2, h3, h4, h5, h6, p')).filter(owns).forEach((copy, index) => {
          animations.push(copy.animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 850, delay: delay + 120 + Math.min(index, 3) * 90, easing, fill: 'backwards' }));
        });
      };
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) reveal();
      }, { rootMargin: sleek ? '0px 0px -24px' : '0px 0px 40px', threshold: individual ? 0 : .05 });

      // Only hide content below the viewport; avoid a flash after server rendering.
      if (element.getBoundingClientRect().top >= window.innerHeight) element.style.opacity = '0';
      observer.observe(element);
      const onFocus = () => { reveal(true); animations.forEach(animation => animation.finish()); };
      const onPreference = () => { if (reduced.matches) onFocus(); };
      element.addEventListener('focusin', onFocus);
      reduced.addEventListener('change', onPreference);
      return () => {
        observer.disconnect();
        animations.forEach(animation => animation.cancel());
        element.style.opacity = '';
        element.removeEventListener('focusin', onFocus);
        reduced.removeEventListener('change', onPreference);
      };
    };
    const elements = individual ? Array.from(root.children).filter((child): child is HTMLElement => child instanceof HTMLElement) : [root];
    const cleanups = elements.map(attach);
    return () => cleanups.forEach(cleanup => cleanup());
  }, [ref, order, individual]);
}
