'use client';

import { useEffect } from 'react';

const MAX_TILT = 4;

/**
 * Pointer tilt and light for cards marked data-tilt (styles in motion.css). One delegated listener
 * serves every card: only the card under the mouse is touched, once per frame, and only through
 * custom properties. Touch, pen and keyboard users, and anyone preferring reduced motion, get
 * the plain cards. The tilt is dropped the instant a card is pressed, so the shared-image
 * transition to the detail page starts from an upright photo.
 */
export default function CardTilt() {
  useEffect(() => {
    const capable = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let stop = capable.matches ? attach() : () => {};
    const onChange = () => {
      stop();
      stop = capable.matches ? attach() : () => {};
    };
    capable.addEventListener('change', onChange);
    return () => {
      capable.removeEventListener('change', onChange);
      stop();
    };
  }, []);
  return null;
}

function attach() {
  let card: HTMLElement | null = null;
  let frame = 0;
  let x = 0;
  let y = 0;

  const paint = () => {
    frame = 0;
    if (!card) return;
    const box = card.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const px = Math.min(1, Math.max(0, (x - box.left) / box.width));
    const py = Math.min(1, Math.max(0, (y - box.top) / box.height));
    card.style.setProperty('--tilt-x', `${((0.5 - py) * 2 * MAX_TILT).toFixed(2)}deg`);
    card.style.setProperty('--tilt-y', `${((px - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
    card.style.setProperty('--glow-x', `${(px * 100).toFixed(1)}%`);
    card.style.setProperty('--glow-y', `${(py * 100).toFixed(1)}%`);
  };

  const release = (instant: boolean) => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (!card) return;
    if (instant) card.style.transition = 'none';
    card.removeAttribute('data-tilting');
    for (const name of ['--tilt-x', '--tilt-y', '--glow-x', '--glow-y']) card.style.removeProperty(name);
    card = null;
  };

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    const next = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-tilt]') : null;
    if (next !== card) {
      release(false);
      card = next;
      if (!card) return;
      card.style.removeProperty('transition');
      card.setAttribute('data-tilting', '');
    }
    x = event.clientX;
    y = event.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  };
  const onLeave = (event: PointerEvent) => { if (!event.relatedTarget) release(false); };
  const onPress = () => release(true);
  // Cards move under a still pointer while scrolling, and no pointer event follows.
  const onScroll = () => release(false);

  document.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('pointerout', onLeave, { passive: true });
  document.addEventListener('pointerdown', onPress, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    release(true);
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerout', onLeave);
    document.removeEventListener('pointerdown', onPress);
    window.removeEventListener('scroll', onScroll);
  };
}
