'use client';

import { useEffect, type RefObject } from 'react';

/** Progressive enhancement: server-rendered content stays visible without JavaScript. */
export function useReveal(ref: RefObject<HTMLElement | null>, order = 0, individual = false) {
  useEffect(() => {
    const root = ref.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!root || reduced.matches || !('IntersectionObserver' in window)) return;

    const attach = (element: HTMLElement, index: number) => {
      const detail = Boolean(element.closest('[data-place-page]'));
      const sleek = Boolean(element.closest('[data-page-motion]'));
      const galleryEntrance = element.hasAttribute('data-reveal-gallery');
      const hasGlassPanel = Boolean(element.querySelector('.placeContent'));
      const easing = 'cubic-bezier(.22, 1, .36, 1)';
      let revealed = false;
      const animations: Animation[] = [];
      const owns = (node: Element) => !element.hasAttribute('data-reveal-group') || node.closest('[data-reveal-group]') === element;

      const reveal = (immediate = false) => {
        if (revealed) return;
        revealed = true;
        element.style.opacity = '';
        observer.disconnect();
        if (immediate || reduced.matches) return;

        const delay = detail ? Math.min(order + index, 5) * 58 :
          window.innerWidth > 600 ? ((order + index) % 3) * (sleek ? 80 : 50) : 0;
        const duration = detail ? 360 : sleek ? 800 : 900;
        if (galleryEntrance) {
          // Keep the LCP photo/frame stable through hydration; animate controls only.
          const controls = Array.from(element.querySelectorAll('[data-gallery-control], [data-gallery-thumbnails]'))
            .filter(node => owns(node));
          controls.forEach((control, controlIndex) => animations.push(control.animate([
            { opacity: 0, translate: '0 6px' },
            { opacity: 1, translate: '0 0' },
          ], { duration: 230, delay: delay + 110 + controlIndex * 55, easing, fill: 'backwards' })));
        } else if (!(detail && individual)) {
          animations.push(element.animate(hasGlassPanel ? [
            { opacity: 0 }, { opacity: 1 },
          ] : [
            { opacity: 0, transform: detail ? 'translateY(8px)' : sleek ? 'translateY(12px)' : 'translateY(18px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration, delay, easing, fill: 'backwards' }));
        }

        if (detail && individual) {
          const blocks = Array.from(root!.children).filter((node): node is HTMLElement => node instanceof HTMLElement &&
            node.matches('h2, h3, h4, h5, h6, img, blockquote, .tableScroll, table'));
          const target = blocks[index];
          if (target) {
            const isImage = target.matches('img');
            const quiet = target.matches('blockquote, .tableScroll, table');
            animations.push(target.animate(isImage ? [
              { opacity: 0, transform: 'scale(1.018)' },
              { opacity: 1, transform: 'scale(1)' },
            ] : [
              { opacity: 0, transform: `translateY(${quiet ? 4 : 8}px)` },
              { opacity: 1, transform: 'translateY(0)' },
            ], { duration: isImage ? 460 : quiet ? 320 : 360, delay, easing, fill: 'backwards' }));
          }
        } else if (!detail) {
          const media = Array.from(element.querySelectorAll(sleek ? '[data-reveal-image], img[alt]:not([alt=""])' : '[data-reveal-image]'))
            .filter(node => owns(node) && (node.hasAttribute('data-reveal-image') || !node.closest('[data-reveal-image]')));
          media.forEach(image => animations.push(image.animate(sleek ? [
            { opacity: 0, transform: 'scale(1.055)' },
            { opacity: 1, transform: 'scale(1.015)', offset: .5 },
            { opacity: 1, transform: 'scale(1)' },
          ] : [
            { transform: 'scale(1.025)' }, { transform: 'scale(1)' },
          ], { duration: sleek ? 1500 : 1200, delay, easing, fill: 'backwards' })));
        }

        if (detail && !galleryEntrance && element.hasAttribute('data-reveal-group')) {
          const copy = Array.from(element.querySelectorAll('[data-reveal-copy], h1, h2, h3, h4, h5, h6')).filter(owns);
          copy.forEach((node, copyIndex) => animations.push(node.animate([
            { opacity: 0, transform: 'translateY(7px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 340, delay: delay + copyIndex * 54, easing, fill: 'backwards' })));
          const detailMedia = Array.from(element.querySelectorAll('[data-reveal-image]')).filter(owns);
          detailMedia.forEach(node => animations.push(node.animate([
            { transform: 'scale(1.018)' }, { transform: 'scale(1)' },
          ], { duration: 420, delay, easing, fill: 'backwards' })));
        } else if (sleek && !detail) {
          const copy = Array.from(element.querySelectorAll('[data-reveal-copy], h1, h2, h3, h4, h5, h6, p')).filter(owns);
          copy.forEach((node, copyIndex) => animations.push(node.animate([
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ], { duration: 850, delay: delay + 120 + Math.min(copyIndex, 3) * 90, easing, fill: 'backwards' })));
        }
      };

      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) reveal();
        else if (!revealed && !galleryEntrance && entries.some(entry => entry.boundingClientRect.top >= window.innerHeight)) {
          element.style.opacity = '0';
        }
      }, { rootMargin: detail ? '0px 0px -20px' : sleek ? '0px 0px -24px' : '0px 0px 40px', threshold: individual ? 0 : .05 });

      // IntersectionObserver supplies geometry without interleaved DOM reads/writes.
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

    const detail = Boolean(root.closest('[data-place-page]'));
    const elements = individual
      ? detail
        ? Array.from(root.children).filter((child): child is HTMLElement => child instanceof HTMLElement &&
          child.matches('h2, h3, h4, h5, h6, img, blockquote, .tableScroll, table'))
        : Array.from(root.children).filter((child): child is HTMLElement => child instanceof HTMLElement)
      : [root];
    const cleanups = elements.map((element, index) => attach(element, index));
    return () => cleanups.forEach(cleanup => cleanup?.());
  }, [ref, order, individual]);
}
