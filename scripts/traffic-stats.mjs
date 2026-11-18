#!/usr/bin/env node
/**
 * Nightly traffic statistics: nginx access logs -> one SQLite file, one set of rows per UTC day.
 *
 *   traffic-stats.mjs                  store every complete day found in the logs (idempotent)
 *   traffic-stats.mjs --date 2026-11-16        only that day
 *   traffic-stats.mjs --show 14        print the last 14 days (and recent deploys) from the database
 *   traffic-stats.mjs --mark-deploy "note"     record a deploy now, to read vitals against releases
 *   traffic-stats.mjs --db FILE --log FILE...  other database / log files (testing)
 *
 * Requests come from the log itself; real-user numbers come from the browser beacons in the
 * same log, through the same code as `rum-report.mjs`, so the two never disagree.
 * Re-running replaces the rows of the days it reads, so history that has aged out of the
 * log rotation stays in the database untouched.
 *
 * Tables (keyed by UTC `date`): days, hourly, breakdown, pages, events, vitals, vitals_segments,
 * funnel, bots; also meta and deploys. Views for reading: v_overview, v_weekly, v_top_pages_7d, v_deploys. See docs/operations.md.
 */
import { createReadStream, existsSync, mkdirSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { beaconKey, browserFamily, buildReport, isRealBeacon, isView, logFiles } from './rum-report.mjs';

export const SCHEMA_VERSION = 3;
const DEFAULT_DB = '/var/lib/guidebook-stats/stats.sqlite';
const BOT_MIN_REQUESTS = 300;   // only heavy clients are stored (never ordinary visitors)
const BOT_KEEP_DAYS = 180;
const MONTHS = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
// The request text is kept loose on purpose: scanners send garbage that must still be counted.
const LEGACY = /^(\S+) \S+ \S+ \[(\d\d)\/(\w{3})\/(\d{4}):(\d\d)[^\]]*\] "([^"]*)" (\d{3}) (\d+|-)(?: "[^"]*" "([^"]*)")?/;

const TABLES_SQL = `
CREATE TABLE IF NOT EXISTS meta(key TEXT PRIMARY KEY, value TEXT);

-- One row per UTC day: what the server did, then what real visitors did.
CREATE TABLE IF NOT EXISTS days(
  date TEXT PRIMARY KEY,
  source TEXT,                 -- json | legacy | mixed (log format the day was read from)
  requests INTEGER, bytes INTEGER, p50_ms INTEGER, p95_ms INTEGER, p99_ms INTEGER,
  browser_requests INTEGER, crawler_requests INTEGER, unclassified_requests INTEGER,
  html_pages INTEGER,          -- GET 200 of a page (not an asset, image, API call or beacon)
  assets INTEGER, images INTEGER, api_calls INTEGER, beacons INTEGER,
  ok INTEGER,                  -- 2xx and 304
  redirects INTEGER, not_found INTEGER, rate_limited INTEGER, client_errors INTEGER, server_errors INTEGER,
  browser_pages INTEGER,       -- browser-class page loads (the old "human_pv": includes disguised bots)
  views INTEGER, visitors INTEGER, new_visitors INTEGER, sessions INTEGER, single_view_visitors INTEGER,
  views_measured INTEGER,      -- views whose leave beacon arrived (dwell/scroll known)
  reads INTEGER,               -- scrolled >= 70% and visible >= 20 s
  median_dwell_s REAL, median_scroll_pct REAL,
  contact_visitors INTEGER, wa_clicks INTEGER, wa_visitors INTEGER,
  updated TEXT
  -- columns added in schema 3 are in DAYS_V3 below (existing databases get them by ALTER TABLE)
);

-- Requests and real views per hour (UTC): shows spikes and deploy errors.
CREATE TABLE IF NOT EXISTS hourly(
  date TEXT, hour INTEGER, requests INTEGER, crawler_requests INTEGER,
  rate_limited INTEGER, server_errors INTEGER, views INTEGER,
  PRIMARY KEY(date, hour)
);

-- One narrow table for every breakdown. requests = from the log, views = from beacons.
-- dim: country | status | language | section | device | connection | referrer | utm_source
CREATE TABLE IF NOT EXISTS breakdown(
  date TEXT, dim TEXT, key TEXT, requests INTEGER, views INTEGER,
  PRIMARY KEY(date, dim, key)
);

CREATE TABLE IF NOT EXISTS pages(
  date TEXT, page TEXT, views INTEGER, reads INTEGER, wa_clicks INTEGER,
  PRIMARY KEY(date, page)
);

CREATE TABLE IF NOT EXISTS events(
  date TEXT, event TEXT, clicks INTEGER, visitors INTEGER,
  PRIMARY KEY(date, event)
);

-- Core Web Vitals of real page loads. device: all | m | t | d; metric: lcp_ms | cls_x1000 | inp_ms.
CREATE TABLE IF NOT EXISTS vitals(
  date TEXT, device TEXT, metric TEXT, n INTEGER, p50 INTEGER, p75 INTEGER,
  PRIMARY KEY(date, device, metric)
);

-- LCP by segment. dim: connection | section (page type) | element (i = image, t = text).
CREATE TABLE IF NOT EXISTS vitals_segments(
  date TEXT, dim TEXT, key TEXT, n INTEGER, lcp_p75 INTEGER,
  PRIMARY KEY(date, dim, key)
);

-- From landing source / landing page to engaged to a contact action, in visitors.
-- dim: source | page
CREATE TABLE IF NOT EXISTS funnel(
  date TEXT, dim TEXT, key TEXT, visitors INTEGER, engaged INTEGER, acted INTEGER,
  PRIMARY KEY(date, dim, key)
);

-- Releases, so a change in vitals or conversion can be read against them (--mark-deploy).
CREATE TABLE IF NOT EXISTS deploys(ts TEXT, note TEXT);

-- Heaviest clients of the day (>= ${BOT_MIN_REQUESTS} requests). Ordinary visitors never reach this.
CREATE TABLE IF NOT EXISTS bots(
  date TEXT, client_ip TEXT, requests INTEGER, crawler_pct INTEGER, rate_limited INTEGER,
  country TEXT, user_agent TEXT,
  PRIMARY KEY(date, client_ip)
);

`;

// Columns added in schema 3. Older databases receive them with ALTER TABLE, then the views are rebuilt.
const DAYS_V3 = {
  views_uncertain: 'INTEGER',   // beacons from browsers that fail the human checks (fetch metadata, referer)
  views_bot: 'INTEGER',         // beacons from clients that call themselves crawlers
  engaged_views: 'INTEGER',     // views with 10 s visible or a real interaction
  engaged_visitors: 'INTEGER',
  js_errors: 'INTEGER',         // views that reported a script error
  beacons_limited: 'INTEGER',   // /rum answered 429
  beacons_rejected: 'INTEGER',  // /rum answered another 4xx (wrong method, origin or size)
  beacons_repeated: 'INTEGER',  // repeats of one beacon (retries) that were ignored
  view_coverage: 'REAL',        // likely-human views / browser page loads: how much the beacon sees
  ttfb_p75: 'INTEGER',
  views_confirmed: 'INTEGER',   // likely-human views with an engaged or leave beacon (real use or close was seen)
  visitors_confirmed: 'INTEGER',
};

const VIEWS_SQL = `
DROP VIEW IF EXISTS v_overview;
CREATE VIEW v_overview AS
SELECT date, requests, ROUND(bytes / 1e9, 2) AS gb,
  ROUND(100.0 * crawler_requests / NULLIF(requests, 0), 1) AS crawler_pct,
  server_errors, rate_limited, redirects, p95_ms,
  views, visitors, new_visitors,
  ROUND(1.0 * views / NULLIF(visitors, 0), 2) AS views_per_visitor,
  ROUND(100.0 * single_view_visitors / NULLIF(visitors, 0), 1) AS bounce_pct,
  reads, ROUND(100.0 * reads / NULLIF(views_measured, 0), 1) AS read_pct,
  median_dwell_s, median_scroll_pct, wa_clicks, contact_visitors,
  views_uncertain, views_bot,
  ROUND(100.0 * engaged_views / NULLIF(views, 0), 1) AS engaged_pct,
  ROUND(100.0 * view_coverage, 1) AS coverage_pct,
  views_confirmed, ROUND(100.0 * views_confirmed / NULLIF(views, 0), 1) AS confirmed_pct,
  js_errors, beacons_limited, ttfb_p75
FROM days ORDER BY date;

DROP VIEW IF EXISTS v_weekly;
CREATE VIEW v_weekly AS
SELECT strftime('%Y-W%W', date) AS week, MIN(date) AS from_date, MAX(date) AS to_date, COUNT(*) AS days,
  SUM(requests) AS requests, ROUND(SUM(bytes) / 1e9, 2) AS gb,
  ROUND(100.0 * SUM(crawler_requests) / NULLIF(SUM(requests), 0), 1) AS crawler_pct,
  SUM(server_errors) AS server_errors, SUM(views) AS views, SUM(visitors) AS visitor_days,
  SUM(reads) AS reads, SUM(wa_clicks) AS wa_clicks
FROM days GROUP BY week ORDER BY week;

DROP VIEW IF EXISTS v_top_pages_7d;
CREATE VIEW v_top_pages_7d AS
SELECT page, SUM(views) AS views, SUM(reads) AS reads, SUM(wa_clicks) AS wa_clicks
FROM pages WHERE date >= date('now', '-7 days') GROUP BY page ORDER BY views DESC LIMIT 50;

-- Each deploy next to the day before and the day of it: did vitals or conversion move?
DROP VIEW IF EXISTS v_deploys;
CREATE VIEW v_deploys AS
SELECT d.ts, d.note, o.date AS day, o.views, o.engaged_pct, o.coverage_pct, o.js_errors, o.ttfb_p75, o.wa_clicks
FROM deploys d LEFT JOIN v_overview o ON o.date IN (date(d.ts), date(d.ts, '-1 day')) ORDER BY d.ts DESC, o.date;
`;

// ---------------------------------------------------------------- reading the log

const count = (map, key, by = 1) => map.set(key, (map.get(key) ?? 0) + by);

function newDay(date) {
  return {
    date, jsonLines: 0, legacyLines: 0, requests: 0, bytes: 0, times: [], browser: 0, crawler: 0,
    pages: 0, assets: 0, images: 0, api: 0, beacons: 0, ok: 0, redirects: 0, notFound: 0, rateLimited: 0,
    clientErrors: 0, serverErrors: 0, browserPages: 0, hasInternal: false,
    beaconLimited: 0, beaconRejected: 0, seen: new Set(), pageBrowsers: new Map(),
    hours: new Map(), countries: new Map(), statuses: new Map(), clients: new Map(), beaconRows: [],
  };
}

function kindOf(method, uri) {
  if (uri === '/rum') return 'beacons';
  if (uri.startsWith('/_next/image')) return 'images';
  if (uri.startsWith('/_next/') || /\.[A-Za-z0-9]{1,8}$/.test(uri)) return 'assets';
  if (uri === '/api' || uri.startsWith('/api/')) return 'api';
  return 'pages';
}

/** Parse one log line (JSON, or the combined format used before ~Nov 4) into a flat record. */
export function parseLine(line) {
  if (line.startsWith('{')) {
    try {
      const r = JSON.parse(line);
      return { date: r.timestamp.slice(0, 10), hour: Number(r.timestamp.slice(11, 13)), json: r, method: r.method, uri: r.uri ?? '', status: Number(r.status), bytes: Number(r.bytes) || 0, time: Number(r.request_time), cls: r.traffic_class, country: r.country, ip: r.client_ip, ua: r.user_agent };
    } catch { return null; }
  }
  const m = LEGACY.exec(line);
  if (!m || !MONTHS[m[3]]) return null;
  const [method = '', target = ''] = m[6].split(' ');
  return { date: `${m[4]}-${String(MONTHS[m[3]]).padStart(2, '0')}-${m[2]}`, hour: Number(m[5]), json: null, method, uri: target.split('?')[0], status: Number(m[7]), bytes: m[8] === '-' ? 0 : Number(m[8]), time: NaN, cls: undefined, country: undefined, ip: m[1], ua: m[9] ?? '' };
}

export function addLine(days, line) {
  const r = parseLine(line);
  if (!r) return;
  const day = days.get(r.date) ?? days.set(r.date, newDay(r.date)).get(r.date);
  day[r.json ? 'jsonLines' : 'legacyLines']++;
  day.requests++;
  day.bytes += r.bytes;
  if (r.time >= 0) day.times.push(r.time);
  const hour = day.hours.get(r.hour) ?? day.hours.set(r.hour, { requests: 0, crawler: 0, rateLimited: 0, errors: 0, views: 0 }).get(r.hour);
  hour.requests++;
  const crawler = r.cls === 'claimed_crawler';
  if (crawler) { day.crawler++; hour.crawler++; } else if (r.cls === 'browser_or_other') day.browser++;
  const s = r.status;
  count(day.statuses, String(s));
  if (s === 429) { day.rateLimited++; hour.rateLimited++; }
  else if (s >= 500) { day.serverErrors++; hour.errors++; }
  else if (s === 404) day.notFound++;
  else if (s === 301 || s === 302 || s === 307 || s === 308) day.redirects++;
  else if (s >= 400) day.clientErrors++;
  else if (s >= 200 && s < 300 || s === 304) day.ok++;
  const kind = kindOf(r.method, r.uri);
  if (kind === 'pages') { if (s === 200 && r.method === 'GET') day.pages++; } else day[kind]++;
  if (!r.json) return;
  if (r.country) count(day.countries, r.country);
  if ('internal' in r.json) {
    day.hasInternal = true;
    if (r.cls === 'browser_or_other' && r.json.fetch_dest === 'document' && !r.json.internal && (s === 200 || s === 304)) {
      day.browserPages++;
      count(day.pageBrowsers, browserFamily(r.ua));
    }
  }
  const client = day.clients.get(r.ip) ?? day.clients.set(r.ip, { requests: 0, crawler: 0, limited: 0, country: r.country, ua: r.ua }).get(r.ip);
  client.requests++;
  if (crawler) client.crawler++;
  if (s === 429) client.limited++;
  if (kind === 'beacons') {
    day.beaconRows.push(r.json);
    if (s === 429) day.beaconLimited++;
    else if (s >= 400 && s < 500) day.beaconRejected++;
    // A retried beacon is in the log twice; it counts once.
    const key = beaconKey(r.json);
    const repeat = key !== null && day.seen.has(key);
    if (key !== null) day.seen.add(key);
    if (!repeat && isRealBeacon(r.json) && isView(r.json)) hour.views++;
  }
}

async function readLines(files, handle) {
  for (const file of files) {
    const input = file.endsWith('.gz') ? createReadStream(file).pipe(createGunzip()) : createReadStream(file);
    for await (const line of createInterface({ input, crlfDelay: Infinity })) handle(line);
  }
}

// ---------------------------------------------------------------- turning a day into rows

const quantile = (sorted, q) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] : null);

export function dayRows(day) {
  const start = Date.parse(`${day.date}T00:00:00Z`);
  const end = start + 86_400_000;
  const times = day.times.sort((a, b) => a - b).map(t => Math.round(t * 1000));
  const json = day.jsonLines > 0;
  const rep = day.beaconRows.length ? buildReport(day.beaconRows, start, end, { pages: 100, breakdown: 100 }) : null;
  const row = {
    date: day.date, source: json ? (day.legacyLines ? 'mixed' : 'json') : 'legacy',
    requests: day.requests, bytes: day.bytes, p50_ms: quantile(times, 0.5), p95_ms: quantile(times, 0.95), p99_ms: quantile(times, 0.99),
    browser_requests: json ? day.browser : null, crawler_requests: json ? day.crawler : null,
    unclassified_requests: day.requests - day.browser - day.crawler,
    html_pages: day.pages, assets: day.assets, images: day.images, api_calls: day.api, beacons: day.beacons,
    ok: day.ok, redirects: day.redirects, not_found: day.notFound, rate_limited: day.rateLimited,
    client_errors: day.clientErrors, server_errors: day.serverErrors,
    browser_pages: day.hasInternal ? day.browserPages : null,
    views: rep?.views ?? null, visitors: rep?.visitors ?? null, new_visitors: rep?.new_visitors ?? null,
    sessions: rep?.sessions_started ?? null, single_view_visitors: rep?.single_view_visitors ?? null,
    views_measured: rep?.reads.of_views_with_leave ?? null, reads: rep?.reads.views_read ?? null,
    median_dwell_s: rep?.engagement.median_seconds_visible ?? null, median_scroll_pct: rep?.engagement.median_scroll_percent ?? null,
    contact_visitors: rep?.visitors_with_contact_action ?? null, wa_clicks: rep?.whatsapp.clicks ?? null, wa_visitors: rep?.whatsapp.visitors ?? null,
    views_uncertain: rep?.traffic.views_uncertain ?? null, views_bot: rep?.traffic.views_bot ?? null,
    engaged_views: rep?.engaged.views ?? null, engaged_visitors: rep?.engaged.visitors ?? null, js_errors: rep?.js_errors.views_affected ?? null,
    beacons_limited: json ? day.beaconLimited : null, beacons_rejected: json ? day.beaconRejected : null, beacons_repeated: rep?.beacons_deduped ?? null,
    view_coverage: rep && day.browserPages > 0 ? Number((rep.views / day.browserPages).toFixed(3)) : null,
    ttfb_p75: rep?.web_vitals.ttfb_ms.p75 ?? null,
    views_confirmed: rep?.confirmed.views ?? null, visitors_confirmed: rep?.confirmed.visitors ?? null,
  };

  const hourly = [...day.hours].sort((a, b) => a[0] - b[0]).map(([hour, h]) => ({ date: day.date, hour, requests: h.requests, crawler_requests: h.crawler, rate_limited: h.rateLimited, server_errors: h.errors, views: h.views }));

  const breakdown = new Map();
  const put = (dim, key, field, value) => {
    const entry = breakdown.get(`${dim}\u0000${key}`) ?? breakdown.set(`${dim}\u0000${key}`, { date: day.date, dim, key, requests: null, views: null }).get(`${dim}\u0000${key}`);
    entry[field] = value;
  };
  for (const [key, n] of day.countries) put('country', key, 'requests', n);
  for (const [key, n] of day.statuses) put('status', key, 'requests', n);
  if (rep) {
    for (const [dim, list] of [['country', rep.countries], ['language', rep.languages], ['section', rep.sections], ['device', rep.devices], ['connection', rep.connections], ['referrer', rep.referrers], ['utm_source', rep.utm_source]]) {
      for (const [key, n] of list) put(dim, key, 'views', n);
    }
    for (const [key, n] of rep.browsers) put('browser', key, 'views', n);
    for (const [key, n] of rep.navigation) put('navigation', key, 'views', n);
  }
  // Page loads and beacons per browser: where the beacon sees few of the page loads, it is losing them.
  for (const [key, n] of day.pageBrowsers) put('browser', key, 'requests', n);

  const pages = new Map();
  const page = name => pages.get(name) ?? pages.set(name, { date: day.date, page: name, views: 0, reads: 0, wa_clicks: 0 }).get(name);
  if (rep) {
    for (const [name, n] of rep.top_pages) page(name).views = n;
    for (const [name, n] of rep.reads.top_read_pages) page(name).reads = n;
    for (const [name, n] of rep.whatsapp.by_page) page(name).wa_clicks = n;
  }

  const events = rep ? Object.entries(rep.events).map(([event, clicks]) => ({ date: day.date, event, clicks, visitors: rep.event_visitors[event] ?? 0 })) : [];

  const vitals = [];
  if (rep) {
    for (const [metric, v] of Object.entries(rep.web_vitals)) if (metric !== 'lcp_by_device' && v.n) vitals.push({ date: day.date, device: 'all', metric, n: v.n, p50: v.p50, p75: v.p75 });
    for (const [device, v] of Object.entries(rep.web_vitals.lcp_by_device)) if (v.n) vitals.push({ date: day.date, device, metric: 'lcp_ms', n: v.n, p50: null, p75: v.lcp_p75 });
  }

  const bots = [...day.clients].filter(([, c]) => c.requests >= BOT_MIN_REQUESTS).sort((a, b) => b[1].requests - a[1].requests).slice(0, 15)
    .map(([ip, c]) => ({ date: day.date, client_ip: ip, requests: c.requests, crawler_pct: Math.round(100 * c.crawler / c.requests), rate_limited: c.limited, country: c.country ?? null, user_agent: (c.ua ?? '').slice(0, 120) }));

  const segments = [];
  const funnel = [];
  if (rep) {
    for (const [dim, group] of Object.entries(rep.web_vitals_segments)) for (const [key, v] of Object.entries(group)) segments.push({ date: day.date, dim, key, n: v.n, lcp_p75: v.lcp_p75 });
    for (const [dim, list] of [['source', rep.funnel_by_source], ['page', rep.funnel_by_page]]) for (const [key, visitors, engaged, acted] of list) funnel.push({ date: day.date, dim, key, visitors, engaged, acted });
  }

  return { row, hourly, breakdown: [...breakdown.values()], pages: [...pages.values()], events, vitals, vitals_segments: segments, funnel, bots };
}

// ---------------------------------------------------------------- the database

export function openDatabase(path) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  const old = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'daily'").get();
  const hasMeta = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'meta'").get();
  if (old && !hasMeta) {
    db.close();
    throw new Error(`${path} is a version 1 database (table "daily"). Move it aside, e.g. mv ${path} ${path}.v1, and run again to rebuild it from the logs.`);
  }
  db.exec(TABLES_SQL);
  const have = new Set(db.prepare('PRAGMA table_info(days)').all().map(column => column.name));
  for (const [name, type] of Object.entries(DAYS_V3)) if (!have.has(name)) db.exec(`ALTER TABLE days ADD COLUMN ${name} ${type}`);
  db.exec(VIEWS_SQL);
  db.prepare("INSERT OR REPLACE INTO meta VALUES('schema_version', ?)").run(String(SCHEMA_VERSION));
  return db;
}

const TABLES = ['days', 'hourly', 'breakdown', 'pages', 'events', 'vitals', 'vitals_segments', 'funnel', 'bots'];

export function storeDay(db, rows, now = new Date().toISOString().slice(0, 19) + 'Z') {
  const insert = (table, record) => {
    const columns = Object.keys(record);
    db.prepare(`INSERT INTO ${table}(${columns.join(',')}) VALUES(${columns.map(() => '?').join(',')})`).run(...columns.map(c => record[c] ?? null));
  };
  db.exec('BEGIN');
  try {
    for (const table of TABLES) db.prepare(`DELETE FROM ${table} WHERE date = ?`).run(rows.row.date);
    insert('days', { ...rows.row, updated: now });
    for (const table of TABLES.slice(1)) for (const record of rows[table]) insert(table, record);
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}

export async function buildStats({ db, files, date = null, today = new Date().toISOString().slice(0, 10) }) {
  const days = new Map();
  await readLines(files, line => addLine(days, line));
  let stored = 0;
  for (const [name, day] of [...days].sort()) {
    if (name >= today || (date && name !== date)) continue;   // complete days only
    storeDay(db, dayRows(day));
    stored++;
  }
  const last = db.prepare('SELECT MAX(date) AS d, COUNT(*) AS n FROM days').get();
  db.prepare("INSERT OR REPLACE INTO meta VALUES('built_at', ?)").run(new Date().toISOString());
  db.prepare("INSERT OR REPLACE INTO meta VALUES('last_day', ?)").run(last.d ?? '');
  db.prepare('DELETE FROM bots WHERE date < date(?, ?)').run(today, `-${BOT_KEEP_DAYS} days`);
  return { stored, total: last.n, last: last.d };
}

export function showOverview(db, limit) {
  const rows = db.prepare('SELECT * FROM (SELECT * FROM v_overview ORDER BY date DESC LIMIT ?) ORDER BY date').all(limit);
  const columns = ['date', 'requests', 'gb', 'crawler_pct', 'server_errors', 'rate_limited', 'p95_ms', 'views', 'views_bot', 'visitors', 'confirmed_pct', 'engaged_pct', 'coverage_pct', 'reads', 'read_pct', 'wa_clicks', 'js_errors'];
  const cell = v => (v === null || v === undefined ? '-' : String(v));
  const widths = columns.map(c => Math.max(c.length, ...rows.map(r => cell(r[c]).length)));
  const line = values => values.map((v, i) => (i === 0 ? v.padEnd(widths[i]) : v.padStart(widths[i]))).join('  ');
  const deploys = db.prepare('SELECT ts, note FROM deploys ORDER BY ts DESC LIMIT 5').all();
  return [line(columns), ...rows.map(r => line(columns.map(c => cell(r[c])))), ...(deploys.length ? ['', 'deploys:', ...deploys.map(d => `  ${d.ts}  ${d.note}`)] : [])].join('\n');
}

export function markDeploy(db, note, now = new Date().toISOString().slice(0, 19) + 'Z') {
  db.prepare('INSERT INTO deploys VALUES(?, ?)').run(now, note.slice(0, 200));
}

function parseArgs(argv) {
  const args = { db: DEFAULT_DB, logs: [], date: null, show: null, deploy: null };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--db') args.db = argv[++i];
    else if (flag === '--log') args.logs.push(argv[++i]);
    else if (flag === '--date') args.date = argv[++i];
    else if (flag === '--show') args.show = Number(argv[++i]);
    else if (flag === '--mark-deploy') args.deploy = argv[++i];
    else throw new Error(`Unknown option ${flag}`);
  }
  if (args.date && !/^\d{4}-\d{2}-\d{2}$/.test(args.date)) throw new Error('--date needs YYYY-MM-DD');
  if (args.show !== null && !(args.show > 0)) throw new Error('--show needs a positive number');
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.show !== null) {
    if (!existsSync(args.db)) throw new Error(`No database at ${args.db}`);
    console.log(showOverview(openDatabase(args.db), args.show));
    return;
  }
  const db = openDatabase(args.db);
  if (args.deploy !== null) {
    if (!args.deploy.trim()) throw new Error('--mark-deploy needs a short note');
    markDeploy(db, args.deploy.trim());
    console.log('deploy recorded');
    return;
  }
  const result = await buildStats({ db, files: args.logs.length ? args.logs : logFiles(), date: args.date });
  console.log(`stored ${result.stored} day(s); database has ${result.total} day(s) up to ${result.last}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exit(1); });
}
