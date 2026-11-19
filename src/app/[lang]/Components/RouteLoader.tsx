'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingRing from './LoadingRing';
import { usePresence } from './usePresence';
import styles from './loading-ring.module.css';

const SHOW_AFTER_MS = 200;
// Keeps the veil mounted while it fades out; matches the .4s transition in loading-ring.module.css.
const FADE_OUT_MS = 420;
const GIVE_UP_AFTER_MS = 10000;

/**
 * Emblem loader for client-side route changes. It never covers server-rendered HTML: it appears
 * only when a link click has not finished within SHOW_AFTER_MS and leaves when the route commits.
 */
export default function RouteLoader({ label }: { label: string }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timers = useRef({ show: 0, giveUp: 0 });
  const presence = usePresence(pending, FADE_OUT_MS);

  useEffect(() => {
    const current = timers.current;
    const onClick = (event: MouseEvent) => {
      // Next's Link prevents the default action itself, so defaultPrevented says nothing here.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      window.clearTimeout(current.show);
      window.clearTimeout(current.giveUp);
      current.show = window.setTimeout(() => setPending(true), SHOW_AFTER_MS);
      current.giveUp = window.setTimeout(() => setPending(false), GIVE_UP_AFTER_MS);
    };
    // Back or forward abandons a navigation that has not committed, so the pathname never changes
    // and nothing else would clear the veil before the give-up timer.
    const onHistory = () => {
      window.clearTimeout(current.show);
      window.clearTimeout(current.giveUp);
      setPending(false);
    };
    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onHistory);
    window.addEventListener('pageshow', onHistory);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onHistory);
      window.removeEventListener('pageshow', onHistory);
      window.clearTimeout(current.show);
      window.clearTimeout(current.giveUp);
    };
  }, []);

  useEffect(() => {
    window.clearTimeout(timers.current.show);
    window.clearTimeout(timers.current.giveUp);
    setPending(false);
  }, [pathname]);

  return (
    <div role="status" aria-live="polite">
      {presence !== 'hidden' && <div className={styles.veil} data-leaving={presence === 'leaving' || undefined}>
        <LoadingRing/>
        <span className={styles.text}>{label}</span>
      </div>}
    </div>
  );
}
