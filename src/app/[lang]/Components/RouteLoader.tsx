'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BrandLoader from './BrandLoader';
import styles from './route-loader.module.css';

const SHOW_AFTER_MS = 200;
const GIVE_UP_AFTER_MS = 10000;

/**
 * Full-page loader for client-side navigations only. Server-rendered pages are never hidden:
 * it appears after a link click that has not finished within SHOW_AFTER_MS, and leaves when the
 * new route commits (or gives up), so fast navigations never flash it.
 */
export default function RouteLoader({ label }: { label: string }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    let show = 0, giveUp = 0;
    const onClick = (event: MouseEvent) => {
      // Next's Link prevents the default action itself, so defaultPrevented says nothing here.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>('a[href]');
      if (!link || (link.target && link.target !== '_self') || link.hasAttribute('download')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      window.clearTimeout(show);
      show = window.setTimeout(() => setVisible(true), SHOW_AFTER_MS);
      giveUp = window.setTimeout(() => setVisible(false), GIVE_UP_AFTER_MS);
    };
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.clearTimeout(show);
      window.clearTimeout(giveUp);
    };
  }, [pathname]);

  // Stays mounted so it can fade out; hidden, it is invisible to assistive technology.
  return <div className={styles.overlay} data-visible={visible} aria-hidden={!visible}>
    <BrandLoader size="page" label={label}/>
  </div>;
}
