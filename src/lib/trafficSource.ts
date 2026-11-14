const HOSTNAME = /^[a-z0-9.-]{1,100}$/;
const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;

/**
 * Query string for the first real-user beacon of a visit: where the visitor came
 * from (hostname only, never a path or search terms) plus any campaign tags on the
 * landing URL. Empty for direct visits and for navigation within the site itself.
 */
export function trafficSourceQuery(referrer: string, ownHost: string, search: string): string {
  const params = new URLSearchParams();
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
    const own = ownHost.toLowerCase().replace(/^www\./, '');
    if (host && host !== own && HOSTNAME.test(host)) params.set('ref', host);
  } catch { /* missing or malformed referrer: treat as direct */ }
  const query = new URLSearchParams(search);
  for (const key of CAMPAIGN_KEYS) {
    const value = query.get(key)?.trim().slice(0, 60);
    if (value) params.set(key, value);
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}
