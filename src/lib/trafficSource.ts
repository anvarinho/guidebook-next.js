const HOSTNAME = /^[a-z0-9.-]{1,100}$/;
// Kept in step with the nginx `guidebook_page` map: a plain site path, nothing else.
const PAGE_PATH = /^\/[A-Za-z0-9\/_.-]{0,200}$/;
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

/**
 * Full beacon URL. Every beacon names the page being viewed (`p`, pathname only),
 * because the request's Referer header can be stripped or faked by the client.
 * `source` is the result of trafficSourceQuery on the first view of a visit, else ''.
 */
export function beaconUrl(pathname: string, source = ''): string {
  const parts: string[] = [];
  // The path is restricted to URL-safe characters, so it is sent unencoded and
  // stays readable in the access log.
  if (PAGE_PATH.test(pathname)) parts.push(`p=${pathname}`);
  if (source.startsWith('?') && source.length > 1) parts.push(source.slice(1));
  return parts.length ? `/rum?${parts.join('&')}` : '/rum';
}
