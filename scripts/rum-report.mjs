#!/usr/bin/env node
/**
 * Real-user beacon report from the nginx JSON access log.
 *
 *   rum-report.mjs                      last 24 hours, printed
 *   rum-report.mjs --hours 72           a different window
 *   rum-report.mjs --date 2026-11-16 --json    one UTC day as JSON
 *   rum-report.mjs --log FILE           read FILE instead of the nginx logs (testing)
 *
 * A view is a POST /rum from a browser (not a crawler, not internal) whose Referer is the site
 * itself and, when the browser sends fetch metadata, whose Sec-Fetch-Site is same-origin ("likely
 * human"). Views from crawlers are "bot" and the rest are "uncertain"; they are reported apart,
 * never as visitors. Beacons without an `ev` field (sent before 2026-11-16) count as views.
 * Beacons carry a view id (vi) and a counter (q): a repeat of the same (visitor, vi, ev, q) is a
 * retry and counts once. Leave beacons (ev=l) are merged per (visitor, view id): the largest
 * dwell/scroll wins.
 * The beacon fields are defined in src/lib/rum.ts and the guidebook_rum_* nginx maps.
 */
import { createReadStream, existsSync, readdirSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const NGINX_LOGS = '/var/log/nginx';
const OWN_HOSTS = ['central-asia.live'];
const GOALS = new Set(['wa', 'tel', 'mail', 'contact', 'form']);
const EVENTS = ['wa', 'tel', 'mail', 'contact', 'lang', 'more', 'form'];
// Beacon types that are not interactions: v(iew), l(eave), g (engaged), x (script error).
// A "read" is a view that reached this much of the page and stayed visible this long.
export const READ_SCROLL = 70;
export const READ_SECONDS = 20;

export function logFiles() {
  const rotated = readdirSync(NGINX_LOGS).filter(name => /^access\.log\.\d+\.gz$/.test(name)).sort().reverse();
  return [`${NGINX_LOGS}/access.log`, `${NGINX_LOGS}/access.log.1`, ...rotated.map(name => `${NGINX_LOGS}/${name}`)].filter(existsSync);
}

/** Beacon rows (POST /rum) inside [start, end), streamed so big logs stay cheap. */
export async function readBeacons(files, start, end) {
  const rows = [];
  for (const file of files) {
    const input = file.endsWith('.gz') ? createReadStream(file).pipe(createGunzip()) : createReadStream(file);
    for await (const line of createInterface({ input, crlfDelay: Infinity })) {
      if (!line.includes('"/rum"')) continue;
      let row;
      try { row = JSON.parse(line); } catch { continue; }
      const when = Date.parse(row.timestamp);
      if (row.method === 'POST' && row.uri === '/rum' && when >= start && when < end) rows.push(row);
    }
  }
  return rows;
}

const count = values => {
  const counts = new Map();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
};
const top = (counts, n = 10) => [...counts].sort((a, b) => b[1] - a[1]).slice(0, n);
const median = values => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = sorted.length >> 1;
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};
const percentile = (values, q) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];
};
const share = (part, whole, digits = 3) => (whole ? Number((part / whole).toFixed(digits)) : null);

const fromSite = r => OWN_HOSTS.some(host => (r.referer ?? '').includes(host));
const accepted = r => r.status === 204 || r.status === 499;
const fromBrowser = r => accepted(r) && r.traffic_class === 'browser_or_other';
/** Log lines from before fetch metadata was logged have no field at all and are not judged by it. */
const sameOrigin = r => r.fetch_site === undefined || r.fetch_site === 'same-origin';
/** A beacon from a real visitor's browser: not a crawler, not internal, sent from a page of this site. */
export const isRealBeacon = r => fromBrowser(r) && !r.internal && fromSite(r) && sameOrigin(r);
/** Beacons without an `ev` field predate the extra fields and are page views. */
export const isView = r => !r.ev || r.ev === 'v';

/** How much to trust an accepted beacon: human (likely), bot (claims to be a crawler) or uncertain. */
export const beaconClass = r => (r.traffic_class === 'claimed_crawler' ? 'bot' : isRealBeacon(r) ? 'human' : 'uncertain');

/** Identity of one beacon, shared by its retries; null when it carries no ids (older beacons) or may repeat (leave). */
export const beaconKey = r => (r.vi && r.q && r.ev !== 'l' ? `${r.vid_got || r.vid_set || r.client_ip}|${r.vi}|${r.ev || 'v'}|${r.q}` : null);

/** The beacons without repeats of the same beacon (retries after a lost response). */
export function dedupe(rows) {
  const seen = new Set();
  return rows.filter(r => {
    const key = beaconKey(r);
    if (key === null) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Browser family from a user agent, for comparing page loads with the beacons that arrived. */
export function browserFamily(ua = '') {
  if (/SamsungBrowser/i.test(ua)) return 'samsung';
  if (/Edg(?:e|A|iOS)?\//.test(ua)) return 'edge';
  if (/OPR\/|Opera/.test(ua)) return 'opera';
  if (/Firefox\/|FxiOS/.test(ua)) return 'firefox';
  if (/Chrome\/|CriOS/.test(ua)) return 'chrome';
  if (/Safari\//.test(ua)) return 'safari';
  return 'other';
}

/**
 * `options.pages` and `options.breakdown` set how many rows the page lists and the other
 * breakdowns keep (defaults suit the printed report; the stats database asks for more).
 */
export function buildReport(beacons, start, end, options = {}) {
  const pagesLimit = options.pages ?? 15;
  const breakdownLimit = options.breakdown ?? 10;
  const stats = { window: { from: new Date(start).toISOString(), to: new Date(end).toISOString() }, beacons: beacons.length };
  stats.rejected = Object.fromEntries(count(beacons.filter(r => r.status !== 204 && r.status !== 499).map(r => `${r.status}:${r.traffic_class}`)));
  stats.spoofed_or_foreign_referer = beacons.filter(r => fromBrowser(r) && !fromSite(r)).length;
  const real = dedupe(beacons.filter(isRealBeacon));
  stats.beacons_deduped = beacons.filter(isRealBeacon).length - real.length;
  const viewBeacons = dedupe(beacons.filter(r => accepted(r) && !r.internal && isView(r)));
  const classes = count(viewBeacons.map(beaconClass));
  stats.traffic = {
    views_likely_human: classes.get('human') ?? 0,
    views_uncertain: classes.get('uncertain') ?? 0,
    views_bot: classes.get('bot') ?? 0,
    bot_share: share(classes.get('bot') ?? 0, viewBeacons.length),
  };

  const visitor = r => (r.vid_got || r.vid_set || r.client_ip).replace('gb_vid=', '');
  const page = r => r.page || '';
  const parts = r => [...page(r).split('/'), '', '', ''];
  const views = real.filter(isView);
  const leaves = real.filter(r => r.ev === 'l');
  const events = real.filter(r => EVENTS.includes(r.ev));
  const engagedBeacons = real.filter(r => r.ev === 'g');
  const errors = real.filter(r => r.ev === 'x');

  const perVisitor = count(views.map(visitor));
  stats.views = views.length;
  stats.visitors = perVisitor.size;
  stats.views_per_visitor = perVisitor.size ? Number((views.length / perVisitor.size).toFixed(2)) : 0;
  stats.single_view_visitors = [...perVisitor.values()].filter(n => n === 1).length;
  stats.new_visitors = new Set(views.filter(r => r.new === '1').map(visitor)).size;
  stats.sessions_started = views.filter(r => r.sess === '1').length;
  stats.devices = top(count(views.map(r => r.dev || '?')), breakdownLimit);
  stats.connections = top(count(views.filter(r => r.conn).map(r => r.conn)), breakdownLimit);
  stats.countries = top(count(views.map(r => r.country)), breakdownLimit);
  stats.languages = top(count(views.map(r => parts(r)[1] || '?')), breakdownLimit);
  stats.sections = top(count(views.map(r => parts(r)[2] || 'home')), breakdownLimit);
  stats.top_pages = top(count(views.map(page)), pagesLimit);
  stats.referrers = top(count(views.filter(r => r.ref).map(r => r.ref)), breakdownLimit);
  stats.utm_source = top(count(views.filter(r => r.utm_source).map(r => r.utm_source)), breakdownLimit);
  stats.browsers = top(count(views.map(r => browserFamily(r.user_agent))), breakdownLimit);
  stats.navigation = top(count(views.filter(r => r.nt).map(r => r.nt)), breakdownLimit);
  stats.events = Object.fromEntries(count(events.map(r => r.ev)));
  stats.event_visitors = Object.fromEntries(EVENTS.filter(name => stats.events[name]).map(name => [name, new Set(events.filter(r => r.ev === name).map(visitor)).size]));
  stats.visitors_with_contact_action = new Set(events.filter(r => GOALS.has(r.ev)).map(visitor)).size;

  const viewKey = r => `${visitor(r)}|${r.vi || r.request_id}`;
  // A view is confirmed when the page was seen being used or closed: an engaged or a leave beacon
  // arrived for it. Automated browsers that run the script pass every other check but never close
  // or interact, so unconfirmed views are where they hide (real visitors confirm 90%+ of theirs).
  // Only views that carry a view id can be judged; older beacons are left out.
  const confirmedKeys = new Set([...engagedBeacons, ...leaves].map(viewKey));
  const judged = views.filter(r => r.vi);
  const confirmedViews = judged.filter(r => confirmedKeys.has(viewKey(r)));
  stats.confirmed = {
    views: confirmedViews.length,
    visitors: new Set(confirmedViews.map(visitor)).size,
    unconfirmed_views: judged.length - confirmedViews.length,
    share: share(confirmedViews.length, judged.length),
  };
  const engagedViews = new Set(engagedBeacons.map(viewKey));
  const engagedVisitors = new Set(engagedBeacons.map(visitor));
  stats.engaged = { views: engagedViews.size, visitors: engagedVisitors.size, rate: share(engagedViews.size, views.length) };

  // The funnel follows each visitor from the page and source they arrived on (their session-start
  // view, else their first view) to engaged and to a contact action.
  const landing = new Map();
  for (const r of views) if (!landing.has(visitor(r)) || (r.sess === '1' && landing.get(visitor(r)).sess !== '1')) landing.set(visitor(r), r);
  const actors = new Set(events.filter(r => GOALS.has(r.ev)).map(visitor));
  const funnel = keyOf => {
    const rows = new Map();
    for (const [who, r] of landing) {
      const row = rows.get(keyOf(r)) ?? rows.set(keyOf(r), { visitors: 0, engaged: 0, acted: 0 }).get(keyOf(r));
      row.visitors++;
      if (engagedVisitors.has(who)) row.engaged++;
      if (actors.has(who)) row.acted++;
    }
    return [...rows].sort((a, b) => b[1].visitors - a[1].visitors).map(([key, v]) => [key, v.visitors, v.engaged, v.acted]);
  };
  stats.funnel = { visitors: perVisitor.size, engaged_visitors: engagedVisitors.size, whatsapp_visitors: new Set(events.filter(r => r.ev === 'wa').map(visitor)).size, contact_visitors: actors.size };
  stats.funnel_by_source = funnel(r => (r.sess === '1' ? r.ref || r.utm_source || 'direct' : 'continuing')).slice(0, breakdownLimit);
  stats.funnel_by_page = funnel(r => page(r)).slice(0, pagesLimit);

  stats.js_errors = {
    count: errors.length,
    views_affected: new Set(errors.map(viewKey)).size,
    rate: share(new Set(errors.map(viewKey)).size, views.length, 4),
    top: top(count(errors.map(r => `${r.eh || '?'} ${page(r)}`)), breakdownLimit),
  };

  // One entry per view: the largest dwell and scroll reported by any of its leave beacons.
  const best = new Map();
  // Only the view beacon names the device, so leave beacons borrow it from their view.
  const viewInfo = new Map(views.filter(r => r.vi).map(r => [`${visitor(r)}|${r.vi}`, { dev: r.dev, conn: r.conn }]));
  const whole = value => (value === undefined || value === '' ? null : Number.parseInt(value, 10));
  for (const r of leaves) {
    const key = `${visitor(r)}|${r.vi || r.request_id}`;
    const entry = best.get(key) ?? { dwell: 0, scroll: 0, dev: r.dev || viewInfo.get(key)?.dev, conn: viewInfo.get(key)?.conn || undefined, section: parts(r)[2] || 'home', page: page(r), lcp: null, cls: null, inp: null, ttfb: null, lt: r.lt || undefined };
    best.set(key, entry);
    for (const field of ['dwell', 'scroll']) if (whole(r[field]) !== null) entry[field] = Math.max(entry[field], whole(r[field]));
    for (const field of ['lcp', 'cls', 'inp', 'ttfb']) if (whole(r[field]) !== null) entry[field] = whole(r[field]);
    if (r.lt) entry.lt = r.lt;
  }
  const entries = [...best.values()];
  const isRead = v => v.scroll >= READ_SCROLL && v.dwell >= READ_SECONDS;
  const reads = count(entries.filter(isRead).map(v => v.page));
  const opened = count(entries.map(v => v.page));
  stats.reads = {
    views_read: entries.filter(isRead).length,
    of_views_with_leave: entries.length,
    rule: `scroll >= ${READ_SCROLL}% and >= ${READ_SECONDS}s visible`,
    top_read_pages: top(reads, options.pages ?? 10).map(([name, n]) => [name, n, opened.get(name)]),
  };
  const whatsapp = events.filter(r => r.ev === 'wa');
  const whatsappVisitors = new Set(whatsapp.map(visitor)).size;
  stats.whatsapp = {
    clicks: whatsapp.length,
    visitors: whatsappVisitors,
    visitor_share: perVisitor.size ? Number((whatsappVisitors / perVisitor.size).toFixed(3)) : 0,
    by_page: top(count(whatsapp.map(page)), options.pages ?? 10),
    by_section: top(count(whatsapp.map(r => parts(r)[2] || 'home'))),
    by_language: top(count(whatsapp.map(r => parts(r)[1] || '?'))),
  };
  stats.engagement = {
    views_with_leave_beacon: entries.length,
    median_seconds_visible: median(entries.map(v => v.dwell)),
    median_scroll_percent: median(entries.map(v => v.scroll)),
    share_scrolled_50: share(entries.filter(v => v.scroll >= 50).length, entries.length),
  };
  const vitals = {};
  for (const [name, label] of [['lcp', 'lcp_ms'], ['cls', 'cls_x1000'], ['inp', 'inp_ms'], ['ttfb', 'ttfb_ms']]) {
    const values = entries.map(v => v[name]).filter(v => v !== null);
    vitals[label] = { n: values.length, p50: percentile(values, 0.5), p75: percentile(values, 0.75) };
  }
  const lcpByDevice = {};
  for (const device of ['m', 't', 'd']) {
    const values = entries.filter(v => v.dev === device && v.lcp !== null).map(v => v.lcp);
    lcpByDevice[device] = { n: values.length, lcp_p75: percentile(values, 0.75) };
  }
  stats.web_vitals = { ...vitals, lcp_by_device: lcpByDevice };
  // LCP's 75th percentile by connection, page type (section) and what the LCP element was.
  const segment = field => {
    const groups = new Map();
    for (const v of entries) if (v.lcp !== null && v[field]) (groups.get(v[field]) ?? groups.set(v[field], []).get(v[field])).push(v.lcp);
    return Object.fromEntries([...groups].sort((a, b) => b[1].length - a[1].length).slice(0, breakdownLimit).map(([key, values]) => [key, { n: values.length, lcp_p75: percentile(values, 0.75) }]));
  };
  stats.web_vitals_segments = { connection: segment('conn'), section: segment('section'), element: segment('lt') };
  return stats;
}

export function renderReport(s) {
  const list = pairs => (pairs.length ? pairs.map(([k, v]) => `${k} ${v}`).join(', ') : '-');
  const lines = [
    `${s.window.from.slice(0, 16)} -> ${s.window.to.slice(0, 16)} UTC`,
    `beacons ${s.beacons} (rejected ${Object.keys(s.rejected).length ? JSON.stringify(s.rejected) : 'none'}, foreign referer ${s.spoofed_or_foreign_referer})`,
    `views ${s.views} | visitors ${s.visitors} | views/visitor ${s.views_per_visitor} | single-view visitors ${s.single_view_visitors}`,
    `new visitors ${s.new_visitors} | sessions started ${s.sessions_started} | visitors with a contact action ${s.visitors_with_contact_action}`,
    `traffic: ${s.traffic.views_likely_human} likely human, ${s.traffic.views_uncertain} uncertain, ${s.traffic.views_bot} bot views (bot share ${s.traffic.bot_share ?? '-'}) | repeated beacons ignored ${s.beacons_deduped}`,
    `confirmed (engaged or left): ${s.confirmed.views} views, ${s.confirmed.visitors} visitors | unconfirmed ${s.confirmed.unconfirmed_views} (confirmed share ${s.confirmed.share === null ? '-' : `${(s.confirmed.share * 100).toFixed(0)}%`})`,
    `engaged: ${s.engaged.views} views, ${s.engaged.visitors} visitors (${s.engaged.rate === null ? '-' : `${(s.engaged.rate * 100).toFixed(1)}%`} of views)`,
    `funnel: ${s.funnel.visitors} visitors -> ${s.funnel.engaged_visitors} engaged -> ${s.funnel.contact_visitors} contact action (${s.funnel.whatsapp_visitors} WhatsApp)`,
    `script errors: ${s.js_errors.count} in ${s.js_errors.views_affected} views | top: ${list(s.js_errors.top)}`,
  ];
  for (const key of ['devices', 'connections', 'browsers', 'navigation', 'countries', 'languages', 'sections', 'referrers', 'utm_source', 'top_pages']) lines.push(`${key}: ${list(s[key])}`);
  lines.push(`funnel by source (visitors, engaged, acted): ${s.funnel_by_source.map(([k, v, e, a]) => `${k} ${v}/${e}/${a}`).join(', ') || '-'}`);
  lines.push(`funnel by landing page: ${s.funnel_by_page.slice(0, 8).map(([k, v, e, a]) => `${k} ${v}/${e}/${a}`).join(', ') || '-'}`);
  lines.push(`events: ${Object.keys(s.events).length ? JSON.stringify(s.events) : '-'}`);
  lines.push(`engagement: ${JSON.stringify(s.engagement)}`);
  const r = s.reads;
  lines.push(`reads (${r.rule}): ${r.views_read} of ${r.of_views_with_leave} views | top: ${r.top_read_pages.length ? r.top_read_pages.map(([p, n, o]) => `${p} ${n}/${o}`).join(', ') : '-'}`);
  const w = s.whatsapp;
  lines.push(`whatsapp: ${w.clicks} clicks, ${w.visitors} visitors (${(w.visitor_share * 100).toFixed(1)}% of visitors) | by section: ${list(w.by_section)} | by page: ${list(w.by_page)}`);
  lines.push(`web vitals: ${JSON.stringify(s.web_vitals)}`);
  lines.push(`LCP p75 by segment: ${JSON.stringify(s.web_vitals_segments)}`);
  return lines.join('\n');
}

function parseArgs(argv) {
  const args = { hours: 24, date: null, json: false, log: null };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--json') args.json = true;
    else if (flag === '--hours') args.hours = Number(argv[++i]);
    else if (flag === '--date') args.date = argv[++i];
    else if (flag === '--log') args.log = argv[++i];
    else throw new Error(`Unknown option ${flag}`);
  }
  if (!(args.hours > 0)) throw new Error('--hours needs a positive number');
  if (args.date && !/^\d{4}-\d{2}-\d{2}$/.test(args.date)) throw new Error('--date needs YYYY-MM-DD');
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const now = Date.now();
  let start = now - args.hours * 3600_000;
  let end = now;
  if (args.date) {
    const day = Date.parse(`${args.date}T00:00:00Z`);
    [start, end] = [day, day + 86_400_000];
  }
  const stats = buildReport(await readBeacons(args.log ? [args.log] : logFiles(), start, end), start, end);
  console.log(args.json ? JSON.stringify(stats, null, 1) : renderReport(stats));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exit(1); });
}
