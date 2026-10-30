/** Keep early interaction events queued while the analytics script loads at idle. */
export function sendAnalyticsEvent(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  const browser = window as Window & { dataLayer?: Record<string, unknown>[] };
  (browser.dataLayer ||= []).push(event);
}
