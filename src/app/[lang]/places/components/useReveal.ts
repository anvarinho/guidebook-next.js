'use client';

import { useEffect, type RefObject } from 'react';

/** Progressive enhancement: server-rendered content is visible without JavaScript. */
export function useReveal(ref: RefObject<HTMLElement>, order = 0) {
  useEffect(() => {
    const element = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!element || reduced.matches || !('IntersectionObserver' in window)) return;

    let revealed = false;
    const animations: Animation[] = [];
    const reveal = (immediate = false) => {
      if (revealed) return;
      revealed = true;
      element.style.opacity = '';
      observer.disconnect();
      if (immediate || reduced.matches) return;
      const delay = window.innerWidth > 600 ? (order % 3) * 50 : 0;
      animations.push(element.animate([
        { opacity: 0, transform: 'translateY(18px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 900, delay, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' }));
      const media = element.querySelector('[data-reveal-image]');
      if (media) animations.push(media.animate([
        { transform: 'scale(1.025)' }, { transform: 'scale(1)' },
      ], { duration: 1200, delay, easing: 'cubic-bezier(.16, 1, .3, 1)' }));
    };
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) reveal();
    }, { rootMargin: '0px 0px 40px', threshold: .05 });

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
  }, [ref, order]);
}
