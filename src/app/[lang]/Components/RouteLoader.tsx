'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingRing from './LoadingRing';
import { usePresence } from './usePresence';
import styles from './controls.module.css';

const SHOW_AFTER_MS = 200;
const GIVE_UP_AFTER_MS = 10000;

/**
 * Ring loader for client-side route changes. It never covers server-rendered HTML: it appears
 * only when a link click has not finished within SHOW_AFTER_MS and leaves when the route commits.
 */
export default function RouteLoader({ label }: { label: string }) {
  const pathname = usePathname();
  const [pending, setPending] = useState(false);
  const timers = useRef({ show: 0, giveUp: 0 });
  const presence = usePresence(pending);

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
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
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
    <div className={styles.routeLoader} role="status" aria-live="polite">
      {presence !== 'hidden' && <span className={styles.routeLoaderDisc} data-leaving={presence === 'leaving' || undefined}>
        <LoadingRing large/>
        <span className={styles.srOnly}>{label}</span>
      </span>}
    </div>
  );
}
