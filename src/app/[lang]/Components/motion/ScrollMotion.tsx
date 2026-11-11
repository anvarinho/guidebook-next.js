'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { clamp01, enterProgress, exitProgress } from './progress';
import { onScrollFrame, pageTop, requestScrollFrame } from './scroll';

const TARGETS = '[data-motion], [data-motion-children] > *';

type Target = {
  element: HTMLElement;
  top: number; height: number; span: number; from: number;
  arrives: boolean; leaves: boolean;
  // In view when motion started: stays at rest until it has left through the bottom edge.
  held: boolean;
  enter: string; exit: string;
};

/**
 * Fallback for browsers without CSS scroll-driven animations (motion.css explains the contract).
 * Geometry is cached and measured again when content or the window changes, so a scroll frame
 * is arithmetic plus a few custom-property writes. Browsers with native timelines do nothing here.
 */
export default function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (CSS.supports('animation-timeline: view()')) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let stop = reduced.matches ? () => {} : scrub();
    const onPreference = () => {
      stop();
      stop = reduced.matches ? () => {} : scrub();
    };
    reduced.addEventListener('change', onPreference);
    return () => {
      reduced.removeEventListener('change', onPreference);
      stop();
    };
  }, [pathname]);

  return null;
}

function scrub() {
  const root = document.documentElement;
  let targets: Target[] = [];
  let floatRange = 1;
  let top = '';
  let frame = 0;

  const measure = () => {
    frame = 0;
    const known = new Map(targets.map(target => [target.element, target]));
    const scrollY = Math.max(0, window.scrollY);
    const viewport = window.innerHeight;
    floatRange = parseFloat(getComputedStyle(root).getPropertyValue('--motion-float')) || 1;
    targets = Array.from(document.querySelectorAll<HTMLElement>(TARGETS)).filter(element => element.offsetParent).map(element => {
      const style = getComputedStyle(element);
      const tokens = (element.dataset.motion ?? 'rise').split(/\s+/);
      const before = known.get(element);
      const elementTop = pageTop(element);
      return {
        element, top: elementTop, height: element.offsetHeight,
        span: parseFloat(style.getPropertyValue('--motion-span')) || 1,
        from: parseFloat(style.getPropertyValue('--motion-from')) || 0,
        arrives: tokens.includes('rise') || tokens.includes('settle'),
        leaves: tokens.includes('leave'),
        held: before ? before.held : elementTop < scrollY + viewport,
        enter: before?.enter ?? '', exit: before?.exit ?? '',
      };
    });
    requestScrollFrame();
  };
  const remeasure = () => { if (!frame) frame = requestAnimationFrame(measure); };

  const update = (scrollY: number, viewport: number) => {
    const nextTop = clamp01(scrollY / floatRange).toFixed(3);
    if (nextTop !== top) root.style.setProperty('--motion-top', top = nextTop);
    for (const target of targets) {
      if (target.arrives) {
        if (target.held && target.top >= scrollY + viewport) target.held = false;
        const enter = target.held ? '1' : enterProgress(target.top, scrollY, viewport, target.span, target.from).toFixed(3);
        if (enter !== target.enter) target.element.style.setProperty('--motion-enter', target.enter = enter);
      }
      if (target.leaves) {
        const exit = exitProgress(target.top, target.height, scrollY, viewport).toFixed(3);
        if (exit !== target.exit) target.element.style.setProperty('--motion-exit', target.exit = exit);
      }
    }
  };

  measure();
  const unsubscribe = onScrollFrame(update);
  root.dataset.motion = 'js';

  // Streamed sections, "load more" results, late images and fonts all move or add targets.
  const resize = new ResizeObserver(remeasure);
  resize.observe(document.body);
  const mutations = new MutationObserver(remeasure);
  mutations.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', remeasure);

  return () => {
    unsubscribe();
    resize.disconnect();
    mutations.disconnect();
    window.removeEventListener('resize', remeasure);
    cancelAnimationFrame(frame);
    delete root.dataset.motion;
    root.style.removeProperty('--motion-top');
    for (const target of targets) {
      target.element.style.removeProperty('--motion-enter');
      target.element.style.removeProperty('--motion-exit');
    }
  };
}
