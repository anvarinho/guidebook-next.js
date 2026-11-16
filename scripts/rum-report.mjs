#!/usr/bin/env node
/**
 * Real-user beacon report from the nginx JSON access log.
 *
 *   rum-report.mjs                      last 24 hours, printed
 *   rum-report.mjs --hours 72           a different window
 *   rum-report.mjs --date 2026-11-16 --json    one UTC day as JSON
 *   rum-report.mjs --rollup             write yesterday's JSON to /var/backups/guidebook/rum/
 *   rum-report.mjs --log FILE           read FILE instead of the nginx logs (testing)
 *
 * A view is a POST /rum from a browser (not a crawler, not internal) whose Referer is the site
 * itself. Beacons without an `ev` field (sent before 2026-11-16) count as views. Leave beacons
 * (ev=l) are deduplicated per (visitor, view id): the largest dwell/scroll wins.
 * The beacon fields are defined in src/lib/rum.ts and the guidebook_rum_* nginx maps.
 */
import { createReadStream, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const NGINX_LOGS = '/var/log/nginx';
const OUT_DIR = '/var/backups/guidebook/rum';
const OWN_HOSTS = ['central-asia.live'];
const GOALS = new Set(['wa', 'tel', 'mail', 'contact', 'form']);
const EVENTS = ['wa', 'tel', 'mail', 'contact', 'lang', 'more', 'form'];
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

export function buildReport(beacons, start, end) {
  const stats = { window: { from: new Date(start).toISOString(), to: new Date(end).toISOString() }, beacons: beacons.length };
  stats.rejected = Object.fromEntries(count(beacons.filter(r => r.status !== 204 && r.status !== 499).map(r => `${r.status}:${r.traffic_class}`)));
  const browser = beacons.filter(r => (r.status === 204 || r.status === 499) && r.traffic_class === 'browser_or_other');
  const fromSite = r => OWN_HOSTS.some(host => (r.referer ?? '').includes(host));
  stats.spoofed_or_foreign_referer = browser.filter(r => !fromSite(r)).length;
  const real = browser.filter(r => !r.internal && fromSite(r));

  const visitor = r => (r.vid_got || r.vid_set || r.client_ip).replace('gb_vid=', '');
  const page = r => r.page || '';
  const parts = r => [...page(r).split('/'), '', '', ''];
  const views = real.filter(r => !r.ev || r.ev === 'v');
  const leaves = real.filter(r => r.ev === 'l');
  const events = real.filter(r => EVENTS.includes(r.ev));

  const perVisitor = count(views.map(visitor));
  stats.views = views.length;
  stats.visitors = perVisitor.size;
  stats.views_per_visitor = perVisitor.size ? Number((views.length / perVisitor.size).toFixed(2)) : 0;
  stats.single_view_visitors = [...perVisitor.values()].filter(n => n === 1).length;
  stats.new_visitors = new Set(views.filter(r => r.new === '1').map(visitor)).size;
  stats.sessions_started = views.filter(r => r.sess === '1').length;
  stats.devices = top(count(views.map(r => r.dev || '?')));
  stats.connections = top(count(views.filter(r => r.conn).map(r => r.conn)));
  stats.countries = top(count(views.map(r => r.country)));
  stats.languages = top(count(views.map(r => parts(r)[1] || '?')));
  stats.sections = top(count(views.map(r => parts(r)[2] || 'home')));
  stats.top_pages = top(count(views.map(page)), 15);
  stats.referrers = top(count(views.filter(r => r.ref).map(r => r.ref)));
  stats.utm_source = top(count(views.filter(r => r.utm_source).map(r => r.utm_source)));
  stats.events = Object.fromEntries(count(events.map(r => r.ev)));
  stats.visitors_with_contact_action = new Set(events.filter(r => GOALS.has(r.ev)).map(visitor)).size;

  // One entry per view: the largest dwell and scroll reported by any of its leave beacons.
  const best = new Map();
  const whole = value => (value === undefined || value === '' ? null : Number.parseInt(value, 10));
  for (const r of leaves) {
    const key = `${visitor(r)}|${r.vi || r.request_id}`;
    const entry = best.get(key) ?? { dwell: 0, scroll: 0, dev: r.dev, page: page(r), lcp: null, cls: null, inp: null };
    best.set(key, entry);
    for (const field of ['dwell', 'scroll']) if (whole(r[field]) !== null) entry[field] = Math.max(entry[field], whole(r[field]));
    for (const field of ['lcp', 'cls', 'inp']) if (whole(r[field]) !== null) entry[field] = whole(r[field]);
  }
  const entries = [...best.values()];
  const isRead = v => v.scroll >= READ_SCROLL && v.dwell >= READ_SECONDS;
  const reads = count(entries.filter(isRead).map(v => v.page));
  const opened = count(entries.map(v => v.page));
  stats.reads = {
    views_read: entries.filter(isRead).length,
    of_views_with_leave: entries.length,
    rule: `scroll >= ${READ_SCROLL}% and >= ${READ_SECONDS}s visible`,
    top_read_pages: top(reads).map(([name, n]) => [name, n, opened.get(name)]),
  };
  const whatsapp = events.filter(r => r.ev === 'wa');
  const whatsappVisitors = new Set(whatsapp.map(visitor)).size;
  stats.whatsapp = {
    clicks: whatsapp.length,
    visitors: whatsappVisitors,
    visitor_share: perVisitor.size ? Number((whatsappVisitors / perVisitor.size).toFixed(3)) : 0,
    by_page: top(count(whatsapp.map(page))),
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
  for (const [name, label] of [['lcp', 'lcp_ms'], ['cls', 'cls_x1000'], ['inp', 'inp_ms']]) {
    const values = entries.map(v => v[name]).filter(v => v !== null);
    vitals[label] = { n: values.length, p50: percentile(values, 0.5), p75: percentile(values, 0.75) };
  }
  const lcpByDevice = {};
  for (const device of ['m', 't', 'd']) {
    const values = entries.filter(v => v.dev === device && v.lcp !== null).map(v => v.lcp);
    lcpByDevice[device] = { n: values.length, lcp_p75: percentile(values, 0.75) };
  }
  stats.web_vitals = { ...vitals, lcp_by_device: lcpByDevice };
  return stats;
}

export function renderReport(s) {
  const list = pairs => (pairs.length ? pairs.map(([k, v]) => `${k} ${v}`).join(', ') : '-');
  const lines = [
    `${s.window.from.slice(0, 16)} -> ${s.window.to.slice(0, 16)} UTC`,
    `beacons ${s.beacons} (rejected ${Object.keys(s.rejected).length ? JSON.stringify(s.rejected) : 'none'}, foreign referer ${s.spoofed_or_foreign_referer})`,
    `views ${s.views} | visitors ${s.visitors} | views/visitor ${s.views_per_visitor} | single-view visitors ${s.single_view_visitors}`,
    `new visitors ${s.new_visitors} | sessions started ${s.sessions_started} | visitors with a contact action ${s.visitors_with_contact_action}`,
  ];
  for (const key of ['devices', 'connections', 'countries', 'languages', 'sections', 'referrers', 'utm_source', 'top_pages']) lines.push(`${key}: ${list(s[key])}`);
  lines.push(`events: ${Object.keys(s.events).length ? JSON.stringify(s.events) : '-'}`);
  lines.push(`engagement: ${JSON.stringify(s.engagement)}`);
  const r = s.reads;
  lines.push(`reads (${r.rule}): ${r.views_read} of ${r.of_views_with_leave} views | top: ${r.top_read_pages.length ? r.top_read_pages.map(([p, n, o]) => `${p} ${n}/${o}`).join(', ') : '-'}`);
  const w = s.whatsapp;
  lines.push(`whatsapp: ${w.clicks} clicks, ${w.visitors} visitors (${(w.visitor_share * 100).toFixed(1)}% of visitors) | by section: ${list(w.by_section)} | by page: ${list(w.by_page)}`);
  lines.push(`web vitals: ${JSON.stringify(s.web_vitals)}`);
  return lines.join('\n');
}

function parseArgs(argv) {
  const args = { hours: 24, date: null, json: false, rollup: false, log: null };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--json') args.json = true;
    else if (flag === '--rollup') args.rollup = true;
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
  if (args.date || args.rollup) {
    const day = args.date ? Date.parse(`${args.date}T00:00:00Z`) : Math.floor(now / 86_400_000) * 86_400_000 - 86_400_000;
    [start, end] = [day, day + 86_400_000];
  }
  const stats = buildReport(await readBeacons(args.log ? [args.log] : logFiles(), start, end), start, end);
  if (args.rollup) {
    mkdirSync(OUT_DIR, { recursive: true });
    const path = `${OUT_DIR}/${new Date(start).toISOString().slice(0, 10)}.json`;
    writeFileSync(path, JSON.stringify(stats, null, 1) + '\n');
    console.log('wrote', path);
  } else console.log(args.json ? JSON.stringify(stats, null, 1) : renderReport(stats));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exit(1); });
}
