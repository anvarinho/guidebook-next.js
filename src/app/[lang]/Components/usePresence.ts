'use client';

import { useEffect, useState } from 'react';

/** Keeps something mounted for `exitMs` after `show` turns false, so it can animate out. */
export function usePresence(show: boolean, exitMs = 320): 'shown' | 'leaving' | 'hidden' {
  const [mounted, setMounted] = useState(show);
  useEffect(() => {
    if (show) {
      setMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(timer);
  }, [show, exitMs]);
  return show ? 'shown' : mounted ? 'leaving' : 'hidden';
}
