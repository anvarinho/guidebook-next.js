'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trafficSourceQuery } from '@/lib/trafficSource';
import {
  ENGAGED_MS, VIEW_MS, beginView, classifyClick, connectionBucket, currentView, deviceBucket, errorHash, isEngaged,
  navigationBucket, scrollPercent, sendRum, startVitals, trackEvent, type Vitals,
} from '@/lib/rum';

/**
 * Real-user beacons, all POSTs to /rum that nginx logs (nothing is stored by the app).
 * Every beacon carries `vi` (the view) and `q` (a counter within it), so a retry is counted once.
 *  - view (e=v): once per page view, after the page has been visible for a second, so bots
 *    that never render rarely get counted. Carries device class, connection, how the page was
 *    reached (nt), whether this is the visitor's first ever visit (n) and the start of a session
 *    (s, with the traffic source).
 *  - engaged (e=g): once per view, after 10 seconds of visible time or a real interaction
 *    (a trusted click, key press or touch).
 *  - leave (e=l): when the page is hidden or navigated away from: seconds visible (t), deepest
 *    scroll (sd) and, for full page loads, LCP (and its element type) / CLS / INP / TTFB.
 *  - interactions (e=wa|tel|mail|contact|lang|more|form): one beacon per click.
 *  - error (e=x): the first script error of a view, as a hash (eh); the message is never sent.
 * A page restored from the back/forward cache starts a new view (nt=c).
 */
export default function RealUserBeacon() {
  const pathname = usePathname();
  const firstPage = useRef(true);
  const vitals = useRef<Vitals | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const element = (event.target as Element | null)?.closest?.('a[href], button, [data-track]');
      const kind = classifyClick(element?.getAttribute('href') ?? null, element?.closest('[data-track]')?.getAttribute('data-track') ?? null);
      if (kind) trackEvent(kind);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    let reportedView = '';
    const report = (message: string, source: string) => {
      const view = currentView();
      if (!view || reportedView === view) return;
      reportedView = view;
      sendRum(location.pathname, { e: 'x', eh: errorHash(message, source) });
    };
    const onError = (event: ErrorEvent) => {
      // Scripts from other origins (extensions, injected widgets) are not ours to report.
      if (event.filename && !event.filename.startsWith(location.origin)) return;
      report(event.message || '', event.filename || '');
    };
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { message?: unknown } | undefined;
      report(String(reason?.message ?? reason ?? ''), 'promise');
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  useEffect(() => {
    const fullLoad = firstPage.current;
    firstPage.current = false;
    if (fullLoad && !vitals.current) vitals.current = startVitals();

    let viewId = beginView();
    const path = location.pathname;
    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    let how: string | undefined = fullLoad ? navigationBucket(navigation?.type) : 's';
    let vitalsDue = fullLoad;
    let visibleMs = 0;
    let since: number | null = document.visibilityState === 'visible' ? performance.now() : null;
    let counted = false;
    let engaged = false;
    let interacted = false;
    let scrolled = 0;
    let timer: number | undefined;

    const pause = () => { if (since !== null) { visibleMs += performance.now() - since; since = null; } };
    const visibleNow = () => visibleMs + (since === null ? 0 : performance.now() - since);
    const seconds = () => Math.min(3600, Math.round(visibleNow() / 1000));
    const onScroll = () => { scrolled = Math.max(scrolled, scrollPercent(window.scrollY, window.innerHeight, document.documentElement.scrollHeight)); };

    const sendView = () => {
      counted = true;
      let source = '';
      let sessionStart: number | undefined;
      let firstVisit: number | undefined;
      // The traffic source is sent once per visit: the browser keeps reporting the original
      // referrer during in-site navigation, which would repeat it.
      try {
        if (!sessionStorage.getItem('gb_src')) {
          sessionStorage.setItem('gb_src', '1');
          sessionStart = 1;
          source = trafficSourceQuery(document.referrer, location.hostname, location.search);
        }
      } catch { /* storage blocked: skip the source rather than repeat it */ }
      try {
        if (!localStorage.getItem('gb_seen')) { localStorage.setItem('gb_seen', '1'); firstVisit = 1; }
      } catch { /* storage blocked: new vs returning stays unknown */ }
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
      sendRum(path, {
        e: 'v', vi: viewId, d: deviceBucket(window.innerWidth), c: connectionBucket(connection?.effectiveType), nt: how, n: firstVisit, s: sessionStart,
      }, source);
    };
    const sendEngaged = () => {
      engaged = true;
      sendRum(path, { e: 'g', vi: viewId, t: seconds() });
    };
    const sendLeave = () => {
      if (!counted) return;
      onScroll();
      sendRum(path, { e: 'l', vi: viewId, t: seconds(), sd: scrolled, ...(vitalsDue ? vitals.current?.read() : undefined) }, '', true);
    };

    // One timer drives both thresholds. It only runs while the page is visible, so time spent in
    // a background tab never counts, and it stays armed across hide/show until both have fired.
    const check = () => {
      window.clearTimeout(timer);
      if (since === null) return;
      const slack = 50;
      if (!counted && visibleNow() >= VIEW_MS - slack) sendView();
      if (counted && !engaged && isEngaged(visibleNow() + slack, interacted)) sendEngaged();
      const next = !counted ? VIEW_MS : !engaged ? ENGAGED_MS : null;
      if (next !== null) timer = window.setTimeout(check, Math.max(0, next - visibleNow()));
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        window.clearTimeout(timer);
        // pagehide can already have reported this stretch of visibility.
        const wasVisible = since !== null;
        pause();
        if (wasVisible) sendLeave();
      } else { since = performance.now(); check(); }
    };
    const onPageHide = () => { if (since !== null) { pause(); sendLeave(); } };
    // A page restored from the back/forward cache never runs this effect again: it is a new view.
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      viewId = beginView();
      how = 'c';
      vitalsDue = false;
      visibleMs = 0;
      counted = engaged = interacted = false;
      scrolled = 0;
      since = document.visibilityState === 'visible' ? performance.now() : null;
      onScroll();
      check();
    };
    // Only events the visitor really produced count; scripts cannot fake a trusted event.
    const onInteract = (event: Event) => {
      if (!event.isTrusted || interacted) return;
      interacted = true;
      if (counted) check();
    };

    onScroll();
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    for (const type of ['pointerdown', 'keydown', 'touchstart']) window.addEventListener(type, onInteract, { passive: true, capture: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      for (const type of ['pointerdown', 'keydown', 'touchstart']) window.removeEventListener(type, onInteract, true);
      pause();
      sendLeave();
    };
  }, [pathname]);

  return null;
}
