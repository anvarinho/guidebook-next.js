'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import BrandLoader from './BrandLoader';
import styles from './route-loader.module.css';

const SHOW_AFTER_MS = 200;
const EXIT_MS = 450;
const GIVE_UP_AFTER_MS = 10000;
const isHome = (path: string) => /^\/[a-z]{2,3}\/?$/.test(path);

/**
 * Full-screen loader for client-side navigations, identical to the home page loader. It never
 * covers server-rendered HTML: it appears only when a link click has not finished within
 * SHOW_AFTER_MS, then plays the home loader's exit when the new route commits. Navigating to the
 * home page hands over to the home loader itself without replaying its arrival.
 */
export default function RouteLoader({ label }: { label: string }) {
  const pathname = usePathname();
  const [state, setState] = useState<'hidden' | 'shown' | 'done'>('hidden');
  const [shownCount, setShownCount] = useState(0);
  const [portalReady, setPortalReady] = useState(false);
  const pending = useRef(0);
  const shown = useRef(false);

  useEffect(() => {
    setPortalReady(true);
    // Warm the cache so the artwork is ready the first time the loader appears.
    for (const src of ['/intro/optimized/kyrgyz-flag-brush-v2.webp', '/intro/optimized/flag.webp']) new Image().src = src;
    let giveUp = 0;
    const onClick = (event: MouseEvent) => {
      // Next's Link prevents the default action itself, so defaultPrevented says nothing here.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      window.clearTimeout(pending.current);
      window.clearTimeout(giveUp);
      pending.current = window.setTimeout(() => {
        if (isHome(url.pathname)) document.documentElement.dataset.loaderHandoff = '';
        shown.current = true;
        setShownCount(count => count + 1);
        setState('shown');
      }, SHOW_AFTER_MS);
      giveUp = window.setTimeout(() => { shown.current = false; setState('hidden'); }, GIVE_UP_AFTER_MS);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.clearTimeout(pending.current);
      window.clearTimeout(giveUp);
    };
  }, []);

  useEffect(() => {
    window.clearTimeout(pending.current);
    if (!isHome(pathname)) delete document.documentElement.dataset.loaderHandoff;
    if (!shown.current) return;
    shown.current = false;
    // The home page shows the same loader, already in place: hand over without an exit.
    if (isHome(pathname)) { setState('hidden'); return; }
    setState('done');
    const exit = window.setTimeout(() => setState('hidden'), EXIT_MS);
    return () => window.clearTimeout(exit);
  }, [pathname]);

  if (!portalReady) return null;
  return createPortal(
    <div className={styles.overlay} data-state={state} aria-hidden={state !== 'shown'}>
      {state !== 'hidden' && <BrandLoader key={shownCount} size="page" label={label}/>}
    </div>,
    document.body,
  );
}
