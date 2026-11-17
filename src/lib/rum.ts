import { beaconUrl } from './trafficSource';

/** Interaction events the beacon reports. Kept in step with the nginx `guidebook_rum_event` map. */
export const RUM_EVENTS = ['wa', 'tel', 'mail', 'contact', 'lang', 'more', 'form'] as const;
export type RumEvent = (typeof RUM_EVENTS)[number];
export type RumFields = Record<string, string | number | undefined>;

/** A view counts once the page has been visible this long (bots that never render rarely get there). */
export const VIEW_MS = 1000;
/** A view is engaged after this much visible time, or sooner on a real interaction. */
export const ENGAGED_MS = 10_000;

/** Whether a counted view has earned the `engaged` beacon. */
export function isEngaged(visibleMs: number, interacted: boolean): boolean {
  return interacted || visibleMs >= ENGAGED_MS;
}

/** How the page was reached: n(avigate), r(eload), b(ack/forward), p(rerender); nothing when unknown. */
export function navigationBucket(type: unknown): 'n' | 'r' | 'b' | 'p' | undefined {
  switch (type) {
    case 'navigate': return 'n';
    case 'reload': return 'r';
    case 'back_forward': return 'b';
    case 'prerender': return 'p';
    default: return undefined;
  }
}

/** Short stable id (8 chars of a-z0-9) that ties a view's beacons together. */
export function randomId(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(8);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('');
}

/** Eight hex digits that group the same script error without sending its text. */
export function errorHash(message: string, source: string): string {
  let hash = 5381;
  for (const char of `${message.slice(0, 200)}|${source.replace(/[?#].*$/, '').slice(-120)}`) hash = ((hash * 33) ^ char.charCodeAt(0)) >>> 0;
  return hash.toString(16).padStart(8, '0');
}

/**
 * How long to wait before retrying a rejected beacon once, or null to give up. Only rate limits
 * (429) and server errors are worth retrying; the wait follows Retry-After, within 1-5 seconds.
 */
export function retryDelay(status: number, retryAfter: string | null): number | null {
  if (status !== 429 && status < 500) return null;
  const seconds = Number(retryAfter);
  const wanted = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 2000;
  return Math.min(5000, Math.max(1000, wanted));
}

// The view the page is in, and a per-view counter. Every beacon carries both (`vi`, `q`), so a
// beacon that is sent twice (a retry) has the same id and the server counts it once.
const state = { view: '', seq: 0 };

export function beginView(): string {
  state.view = randomId();
  state.seq = 0;
  return state.view;
}
export function currentView(): string {
  return state.view;
}

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

/**
 * Sends one beacon. While the page stays open it uses fetch, so a 429 or 5xx is seen and retried
 * once with the same ids; `leaving` beacons (the page is going away) use sendBeacon, which can
 * only queue the request.
 */
export function sendRum(pathname: string, fields: RumFields, source = '', leaving = false): void {
  try {
    const url = rumUrl(pathname, { vi: state.view, ...fields, q: Math.min(++state.seq, 999) }, source);
    if (leaving && navigator.sendBeacon?.(url)) return;
    void post(url, 0);
  } catch { /* counting must never break the page */ }
}

function post(url: string, attempt: number): Promise<void> {
  const again = (delay: number) => { if (attempt === 0) window.setTimeout(() => { void post(url, 1); }, delay); };
  return fetch(url, { method: 'POST', keepalive: true }).then(
    response => { const delay = retryDelay(response.status, response.headers.get('retry-after')); if (delay !== null) again(delay); },
    () => again(2000),
  );
}

export function trackEvent(event: RumEvent): void {
  sendRum(location.pathname, { e: event });
}

type LayoutShift = PerformanceEntry & { value: number; hadRecentInput: boolean };
type EventTiming = PerformanceEntry & { interactionId?: number };
type LcpEntry = PerformanceEntry & { url?: string; element?: Element | null };

export type Vitals = { read(): { lcp?: number; lt?: 'i' | 't'; cls?: number; inp?: number; ttfb?: number } };

/**
 * Collects the three Core Web Vitals of a full page load with raw PerformanceObservers
 * (no library): LCP (and whether its element is an image or text), CLS over its worst
 * 5-second window, and INP as the slowest interaction, plus the time to first byte.
 */
export function startVitals(): Vitals {
  let lcp = 0;
  let lcpType: 'i' | 't' | undefined;
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
  watch('largest-contentful-paint', entries => {
    const last = entries[entries.length - 1] as LcpEntry | undefined;
    if (!last) return;
    lcp = last.startTime;
    lcpType = last.url || /^(?:IMG|VIDEO|IMAGE|SVG)$/i.test(last.element?.tagName ?? '') ? 'i' : 't';
  });
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
      lt: lcp ? lcpType : undefined,
      cls: cls === undefined ? undefined : Math.round(cls * 1000),
      inp: inp ? Math.round(inp) : undefined,
      ttfb: firstByte(),
    }),
  };
}

function firstByte(): number | undefined {
  try {
    const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return navigation && navigation.responseStart > 0 ? Math.round(navigation.responseStart) : undefined;
  } catch { return undefined; }
}
