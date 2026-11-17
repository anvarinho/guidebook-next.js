const { test } = require('node:test');
const assert = require('node:assert/strict');

const load = () => import('../scripts/traffic-stats.mjs');

function json(day, hour, fields = {}) {
  return JSON.stringify({
    timestamp: `${day}T${String(hour).padStart(2, '0')}:10:00+00:00`, method: 'GET', uri: '/en', status: 200, bytes: 1000, request_time: 0.01,
    traffic_class: 'browser_or_other', internal: false, country: 'KG', client_ip: '1.1.1.1', fetch_dest: 'document', user_agent: 'Mozilla/5.0',
    referer: '', vid_got: '', vid_set: '', ...fields,
  });
}
const beacon = (day, hour, visitor, ev, fields = {}) => json(day, hour, {
  method: 'POST', uri: '/rum', status: 204, bytes: 0, client_ip: `2.2.2.${visitor}`, vid_got: `gb_vid=${visitor}`, fetch_dest: 'empty',
  referer: 'https://central-asia.live/en/tours/x', page: '/en/tours/x', ev, dev: 'm', conn: '4g', vi: `v${visitor}`, ...fields,
});
const legacy = (day, hour, status, bytes = 500) => {
  const [y, m, d] = day.split('-');
  const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m) - 1];
  return `9.9.9.9 - - [${d}/${month}/${y}:${String(hour).padStart(2, '0')}:05:00 +0000] "GET /en/places HTTP/1.1" ${status} ${bytes} "-" "Mozilla/5.0"`;
};

async function build(lines, options = {}) {
  const { openDatabase, addLine, dayRows, storeDay } = await load();
  const db = openDatabase(':memory:');
  const days = new Map();
  for (const line of lines) addLine(days, line);
  for (const day of [...days.values()].sort((a, b) => a.date.localeCompare(b.date))) storeDay(db, dayRows(day));
  return db;
}

test('one day: request classes, status groups, hours and percentiles', async () => {
  const lines = [
    json('2026-11-10', 3), json('2026-11-10', 3, { traffic_class: 'claimed_crawler', client_ip: '3.3.3.3' }),
    json('2026-11-10', 4, { status: 429, traffic_class: 'claimed_crawler' }), json('2026-11-10', 4, { status: 500 }),
    json('2026-11-10', 5, { status: 302 }), json('2026-11-10', 5, { status: 404, uri: '/nope' }),
    json('2026-11-10', 5, { uri: '/_next/image', bytes: 5000 }), json('2026-11-10', 5, { uri: '/_next/static/a.js' }),
    json('2026-11-10', 6, { uri: '/api/places' }),
  ];
  const db = await build(lines);
  const d = db.prepare('SELECT * FROM days WHERE date = ?').get('2026-11-10');
  assert.equal(d.requests, 9);
  assert.equal(d.crawler_requests, 2);
  assert.equal(d.browser_requests, 7);
  assert.equal(d.unclassified_requests, 0);
  assert.equal(d.rate_limited, 1);
  assert.equal(d.server_errors, 1);
  assert.equal(d.redirects, 1);
  assert.equal(d.not_found, 1);
  assert.equal(d.images, 1);
  assert.equal(d.assets, 1);
  assert.equal(d.api_calls, 1);
  assert.equal(d.html_pages, 2);          // only the two /en requests that returned 200
  assert.equal(d.bytes, 13000);
  assert.equal(d.p50_ms, 10);
  assert.equal(d.source, 'json');
  assert.equal(db.prepare('SELECT requests FROM hourly WHERE date = ? AND hour = 4').get('2026-11-10').requests, 2);
  assert.equal(db.prepare("SELECT requests FROM breakdown WHERE dim = 'status' AND key = '429'").get().requests, 1);
});

test('real visitors, reads, WhatsApp and web vitals come from the beacons', async () => {
  const day = '2026-11-12';
  const lines = [
    beacon(day, 9, 'A', 'v', { new: '1', sess: '1' }), beacon(day, 9, 'A', 'l', { dwell: '40', scroll: '90', lcp: '1800', cls: '0' }),
    beacon(day, 9, 'A', 'wa'),
    beacon(day, 10, 'B', 'v'), beacon(day, 10, 'B', 'l', { dwell: '5', scroll: '20', lcp: '3000' }),
    beacon(day, 10, 'C', 'v', { traffic_class: 'claimed_crawler' }),                 // a crawler: not a visitor
    beacon(day, 10, 'D', 'v', { referer: 'http://spam.example/' }),                  // foreign referer: not a visitor
  ];
  const db = await build(lines);
  const d = db.prepare('SELECT * FROM days WHERE date = ?').get(day);
  assert.equal(d.views, 2);
  assert.equal(d.visitors, 2);
  assert.equal(d.new_visitors, 1);
  assert.equal(d.sessions, 1);
  assert.equal(d.views_measured, 2);
  assert.equal(d.reads, 1);
  assert.equal(d.wa_clicks, 1);
  assert.equal(d.wa_visitors, 1);
  assert.equal(d.beacons, 7);
  assert.deepEqual({ ...db.prepare("SELECT views, reads, wa_clicks FROM pages WHERE page = '/en/tours/x'").get() }, { views: 2, reads: 1, wa_clicks: 1 });
  assert.equal(db.prepare("SELECT views FROM breakdown WHERE dim = 'device' AND key = 'm'").get().views, 2);
  assert.equal(db.prepare("SELECT clicks, visitors FROM events WHERE event = 'wa'").get().visitors, 1);
  assert.equal(db.prepare("SELECT n FROM vitals WHERE device = 'all' AND metric = 'lcp_ms'").get().n, 2);
  assert.equal(db.prepare('SELECT views FROM hourly WHERE date = ? AND hour = 9').get(day).views, 1);
});

test('legacy lines count requests, bytes and errors but have no class or beacon data', async () => {
  const db = await build([legacy('2026-11-01', 1, 200, 700), legacy('2026-11-01', 2, 500, 300), legacy('2026-11-01', 2, 429)]);
  const d = db.prepare('SELECT * FROM days WHERE date = ?').get('2026-11-01');
  assert.equal(d.source, 'legacy');
  assert.equal(d.requests, 3);
  assert.equal(d.bytes, 1500);
  assert.equal(d.server_errors, 1);
  assert.equal(d.rate_limited, 1);
  assert.equal(d.crawler_requests, null);
  assert.equal(d.unclassified_requests, 3);
  assert.equal(d.views, null);
});

test('garbage request lines from scanners are still counted in legacy logs', async () => {
  const day = '2026-11-02';
  const db = await build([
    '4.4.4.4 - - [02/Nov/2026:05:00:01 +0000] "\\x16\\x03\\x01\\x02" 400 150 "-" "-"',
    '4.4.4.4 - - [02/Nov/2026:05:00:02 +0000] "" 408 0 "-" "-"',
    '4.4.4.4 - - [02/Nov/2026:05:00:03 +0000] "GET / HTTP/1.1" 200 90',
    legacy(day, 6, 200),
  ]);
  assert.equal(db.prepare('SELECT requests FROM days WHERE date = ?').get(day).requests, 4);
});

test('re-running replaces a day, keeps other days, and only complete days are stored', async () => {
  const { openDatabase, buildStats } = await load();
  const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
  const { tmpdir } = require('node:os');
  const dir = mkdtempSync(`${tmpdir()}/stats-`);
  try {
    const a = `${dir}/a.log`;
    writeFileSync(a, [json('2026-11-10', 1), json('2026-11-10', 2), json('2026-11-11', 1), json('2026-11-12', 1)].join('\n'));
    const db = openDatabase(':memory:');
    let result = await buildStats({ db, files: [a], today: '2026-11-12' });
    assert.equal(result.stored, 2);                                                    // the 12th is still "today"
    assert.equal(db.prepare('SELECT requests FROM days WHERE date = ?').get('2026-11-10').requests, 2);
    // The log now only contains the 11th (the 10th aged out of rotation): the 10th must survive.
    const b = `${dir}/b.log`;
    writeFileSync(b, [json('2026-11-11', 1), json('2026-11-11', 2), json('2026-11-11', 3)].join('\n'));
    result = await buildStats({ db, files: [b], today: '2026-11-12' });
    assert.equal(db.prepare('SELECT requests FROM days WHERE date = ?').get('2026-11-10').requests, 2);
    assert.equal(db.prepare('SELECT requests FROM days WHERE date = ?').get('2026-11-11').requests, 3);
    assert.equal(result.total, 2);
    assert.equal(db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get().value, '3');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('only heavy clients are stored as bots, and the views answer common questions', async () => {
  const lines = [];
  for (let i = 0; i < 320; i++) lines.push(json('2026-11-13', i % 24, { client_ip: '8.8.8.8', traffic_class: 'claimed_crawler', user_agent: 'Bot/1.0' }));
  for (let i = 0; i < 5; i++) lines.push(json('2026-11-13', 2, { client_ip: '5.5.5.5' }));
  const db = await build(lines);
  const bots = db.prepare('SELECT * FROM bots').all();
  assert.equal(bots.length, 1);
  assert.equal(bots[0].client_ip, '8.8.8.8');
  assert.equal(bots[0].crawler_pct, 100);
  const overview = db.prepare('SELECT * FROM v_overview').get();
  assert.equal(overview.requests, 325);
  assert.equal(overview.crawler_pct, 98.5);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM v_weekly').get().n, 1);
});

test('a version 1 database is refused with instructions instead of being damaged', async () => {
  const { openDatabase } = await load();
  const { mkdtempSync, rmSync } = require('node:fs');
  const { tmpdir } = require('node:os');
  const { DatabaseSync } = require('node:sqlite');
  const dir = mkdtempSync(`${tmpdir()}/stats-`);
  try {
    const old = new DatabaseSync(`${dir}/stats.sqlite`);
    old.exec('CREATE TABLE daily(date TEXT PRIMARY KEY, requests INTEGER)');
    old.close();
    assert.throws(() => openDatabase(`${dir}/stats.sqlite`), /version 1 database/);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('retried beacons count once, in the report totals and in the hours', async () => {
  const day = '2026-11-12';
  const view = { vi: 'abcd1234', q: '1' };
  const db = await build([
    beacon(day, 9, 'A', 'v', view), beacon(day, 9, 'A', 'v', view),               // one view, sent twice
    beacon(day, 9, 'A', 'wa', { vi: 'abcd1234', q: '2' }), beacon(day, 9, 'A', 'wa', { vi: 'abcd1234', q: '2' }),
    beacon(day, 9, 'A', 'wa', { vi: 'abcd1234', q: '3' }),                         // a second, real click
  ]);
  const d = db.prepare('SELECT * FROM days WHERE date = ?').get(day);
  assert.equal(d.views, 1);
  assert.equal(d.wa_clicks, 2);
  assert.equal(d.beacons, 5);
  assert.equal(d.beacons_repeated, 2);
  assert.equal(db.prepare('SELECT views FROM hourly WHERE date = ? AND hour = 9').get(day).views, 1);
});

test('traffic classes, engagement, errors, rejected beacons and coverage are stored per day', async () => {
  const day = '2026-11-12';
  const human = { fetch_site: 'same-origin' };
  const lines = [
    json(day, 8, { user_agent: 'Mozilla/5.0 Chrome/120 Safari/537', fetch_dest: 'document' }),
    json(day, 8, { user_agent: 'Mozilla/5.0 Version/17 Safari/605', fetch_dest: 'document' }),
    json(day, 8, { user_agent: 'Mozilla/5.0 Version/17 Safari/605', fetch_dest: 'document', client_ip: '1.1.1.2' }),
    json(day, 8, { user_agent: 'Mozilla/5.0 Chrome/120 Safari/537', fetch_dest: 'document', client_ip: '1.1.1.3' }),
    beacon(day, 9, 'A', 'v', { ...human, nt: 'n', user_agent: 'Mozilla/5.0 Chrome/120 Safari/537' }),
    beacon(day, 9, 'A', 'g', human), beacon(day, 9, 'A', 'x', { ...human, eh: 'deadbeef' }),
    beacon(day, 9, 'A', 'l', { ...human, dwell: '30', scroll: '60', lcp: '2000', ttfb: '300', lt: 'i', conn: '4g' }),
    beacon(day, 9, 'B', 'v', { fetch_site: 'cross-site' }),                                   // browser, but not same-origin: uncertain
    beacon(day, 9, 'C', 'v', { ...human, traffic_class: 'claimed_crawler' }),                  // bot
    beacon(day, 9, 'D', 'v', { ...human, status: 429 }),
    beacon(day, 9, 'E', 'v', { ...human, status: 403 }), beacon(day, 9, 'E', 'v', { ...human, status: 405, method: 'GET' }),
  ];
  const db = await build(lines);
  const d = db.prepare('SELECT * FROM days WHERE date = ?').get(day);
  assert.equal(d.views, 1);
  assert.equal(d.views_uncertain, 1);
  assert.equal(d.views_bot, 1);
  assert.equal(d.engaged_views, 1);
  assert.equal(d.engaged_visitors, 1);
  assert.equal(d.js_errors, 1);
  assert.equal(d.beacons_limited, 1);
  assert.equal(d.beacons_rejected, 2);
  assert.equal(d.ttfb_p75, 300);
  assert.equal(d.view_coverage, 0.25);                                                        // 1 view for 4 browser page loads
  assert.deepEqual(db.prepare("SELECT key, requests, views FROM breakdown WHERE dim = 'browser' ORDER BY key").all().map(r => ({ ...r })), [
    { key: 'chrome', requests: 2, views: 1 }, { key: 'safari', requests: 2, views: null },
  ]);
  assert.equal(db.prepare("SELECT lcp_p75 FROM vitals_segments WHERE dim = 'connection' AND key = '4g'").get().lcp_p75, 2000);
  assert.equal(db.prepare("SELECT lcp_p75 FROM vitals_segments WHERE dim = 'element' AND key = 'i'").get().lcp_p75, 2000);
  assert.deepEqual({ ...db.prepare("SELECT visitors, engaged, acted FROM funnel WHERE dim = 'page'").get() }, { visitors: 1, engaged: 1, acted: 0 });
  assert.equal(db.prepare("SELECT engaged_pct FROM v_overview WHERE date = ?").get(day).engaged_pct, 100);
});

test('a version 2 database is upgraded in place and keeps its days', async () => {
  const { openDatabase, markDeploy, showOverview } = await load();
  const { mkdtempSync, rmSync } = require('node:fs');
  const { tmpdir } = require('node:os');
  const { DatabaseSync } = require('node:sqlite');
  const dir = mkdtempSync(`${tmpdir()}/stats-`);
  try {
    const path = `${dir}/stats.sqlite`;
    let db = openDatabase(path);
    db.prepare("INSERT INTO days(date, requests, views) VALUES('2026-11-01', 10, 4)").run();
    db.exec('DROP VIEW v_overview; DROP VIEW v_deploys; DROP TABLE funnel; DROP TABLE vitals_segments; DROP TABLE deploys');
    for (const column of ['views_uncertain', 'views_bot', 'engaged_views', 'engaged_visitors', 'js_errors', 'beacons_limited', 'beacons_rejected', 'beacons_repeated', 'view_coverage', 'ttfb_p75']) db.exec(`ALTER TABLE days DROP COLUMN ${column}`);
    db.prepare("INSERT OR REPLACE INTO meta VALUES('schema_version', '2')").run();
    db.close();
    db = openDatabase(path);
    assert.equal(db.prepare('SELECT views FROM days WHERE date = ?').get('2026-11-01').views, 4);
    assert.equal(db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get().value, '3');
    markDeploy(db, 'rum v3', '2026-11-17T10:00:00Z');
    assert.match(showOverview(db, 7), /deploys:\n {2}2026-11-17T10:00:00Z {2}rum v3/);
    assert.equal(db.prepare('SELECT note FROM v_deploys').get().note, 'rum v3');
    db.close();
    assert.ok(new DatabaseSync(path));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
