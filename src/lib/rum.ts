import { beaconUrl } from './trafficSource';

/** Interaction events the beacon reports. Kept in step with the nginx `guidebook_rum_event` map. */
export const RUM_EVENTS = ['wa', 'tel', 'mail', 'contact', 'lang', 'more', 'form'] as const;
export type RumEvent = (typeof RUM_EVENTS)[number];
export type RumFields = Record<string, string | number | undefined>;

/** Coarse device class from the viewport width: m(obile), t(ablet) or d(esktop). */
export function deviceBucket(width: number): 'm' | 't' | 'd' {
  return width < 768 ? 'm' : width < 1100 ? 't' : 'd';
}

/** `navigator.connection.effectiveType`, only when it is one of the four known values. */
export function connectionBucket(type: unknown): string | undefined {
  return typeof type === 'string' && /^(?:4g|3g|2g|slow-2g)$/.test(type) ? type : undefined;
}

/** How far down the page the visitor has seen, as a whole percent. */
export function scrollPercent(scrollTop: number, viewport: number, total: number): number {
  if (!(total > 0)) return 0;
  return Math.max(0, Math.min(100, Math.round(((scrollTop + viewport) / total) * 100)));
}

/** Which interaction a link or button stands for, or null for ordinary clicks. */
export function classifyClick(href: string | null, track: string | null): RumEvent | null {
  if (track && (RUM_EVENTS as readonly string[]).includes(track)) return track as RumEvent;
  if (!href) return null;
  if (/^https?:\/\/(?:wa\.me|api\.whatsapp\.com)\//i.test(href)) return 'wa';
  if (/^tel:/i.test(href)) return 'tel';
  if (/^mailto:/i.test(href)) return 'mail';
  if (/^\/[^?#]*\/contact(?:[?#]|$)/.test(href)) return 'contact';
  return null;
}

/**
 * Beacon URL: the page (`p`), then these fields. Missing values are dropped and numbers
 * become whole numbers, so every parameter stays short and URL-safe for the nginx log.
 */
export function rumUrl(pathname: string, fields: RumFields, source = ''): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === '') continue;
    params.set(key, typeof value === 'number' ? String(Math.max(0, Math.round(value))) : value);
  }
  const parts = [params.toString(), source.startsWith('?') ? source.slice(1) : source].filter(Boolean);
  return beaconUrl(pathname, parts.length ? `?${parts.join('&')}` : '');
}

export function sendRum(pathname: string, fields: RumFields, source = ''): void {
  try {
    const url = rumUrl(pathname, fields, source);
    if (!navigator.sendBeacon?.(url)) fetch(url, { method: 'POST', keepalive: true }).catch(() => {});
  } catch { /* counting must never break the page */ }
}

export function trackEvent(event: RumEvent): void {
  sendRum(location.pathname, { e: event });
}

type LayoutShift = PerformanceEntry & { value: number; hadRecentInput: boolean };
type EventTiming = PerformanceEntry & { interactionId?: number };

export type Vitals = { read(): { lcp?: number; cls?: number; inp?: number } };

/**
 * Collects the three Core Web Vitals of a full page load with raw PerformanceObservers
 * (no library): LCP, CLS over its worst 5-second window, and INP as the slowest interaction.
 */
export function startVitals(): Vitals {
  let lcp = 0;
  let inp = 0;
  let cls: number | undefined;
  let windowValue = 0;
  let windowStart = 0;
  let lastShift = 0;
  const watch = (type: string, handle: (entries: PerformanceEntryList) => void, extra: object = {}): boolean => {
    try {
      if (!PerformanceObserver.supportedEntryTypes?.includes(type)) return false;
      new PerformanceObserver(list => handle(list.getEntries())).observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
      return true;
    } catch { return false; }
  };
  watch('largest-contentful-paint', entries => { const last = entries[entries.length - 1]; if (last) lcp = last.startTime; });
  if (watch('layout-shift', entries => {
    for (const entry of entries as LayoutShift[]) {
      if (entry.hadRecentInput) continue;
      if (entry.startTime - lastShift > 1000 || entry.startTime - windowStart > 5000) { windowValue = 0; windowStart = entry.startTime; }
      lastShift = entry.startTime;
      windowValue += entry.value;
      cls = Math.max(cls ?? 0, windowValue);
    }
  })) cls = 0;
  watch('event', entries => {
    for (const entry of entries as EventTiming[]) if (entry.interactionId) inp = Math.max(inp, entry.duration);
  }, { durationThreshold: 40 });
  return {
    read: () => ({
      lcp: lcp ? Math.round(lcp) : undefined,
      cls: cls === undefined ? undefined : Math.round(cls * 1000),
      inp: inp ? Math.round(inp) : undefined,
    }),
  };
}
