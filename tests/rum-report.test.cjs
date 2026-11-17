const { test } = require('node:test');
const assert = require('node:assert/strict');

const START = Date.parse('2026-11-16T00:00:00Z');
const END = START + 86_400_000;
const at = '2026-11-16T10:00:00+00:00';

function row(visitor, page, ev, fields = {}) {
  return {
    timestamp: at, method: 'POST', uri: '/rum', status: 204, traffic_class: 'browser_or_other', internal: false,
    country: 'KG', client_ip: `1.1.1.${visitor}`, vid_got: `gb_vid=${visitor}`, vid_set: '',
    referer: `https://central-asia.live${page}`, request_id: `${visitor}${ev}${fields.vi ?? ''}${Math.random()}`,
    page, ev, dev: 'm', conn: '', new: '', sess: '', vi: '', dwell: '', scroll: '', lcp: '', cls: '', inp: '', ref: '', utm_source: '', ...fields,
  };
}

async function report(rows) {
  const { buildReport } = await import('../scripts/rum-report.mjs');
  return buildReport(rows, START, END);
}

test('leave beacons of one view are merged and reads need depth and time', async () => {
  const s = await report([
    row('A', '/en/tours/x', 'v', { vi: 'a1', new: '1' }),
    row('A', '/en/tours/x', 'l', { vi: 'a1', dwell: '5', scroll: '30', lcp: '2400' }),
    row('A', '/en/tours/x', 'l', { vi: 'a1', dwell: '48', scroll: '85', lcp: '2400' }),
    row('B', '/en/places/y', 'v', { vi: 'b1', dev: 'd' }),
    row('B', '/en/places/y', 'l', { vi: 'b1', dev: 'd', dwell: '9', scroll: '20', lcp: '900' }),
    row('C', '/en/tours/x', 'v', { vi: 'c1' }),
    row('C', '/en/tours/x', 'l', { vi: 'c1', dwell: '30', scroll: '90', lcp: '1800' }),
  ]);
  assert.equal(s.views, 3);
  assert.equal(s.visitors, 3);
  assert.equal(s.new_visitors, 1);
  assert.equal(s.engagement.views_with_leave_beacon, 3);
  assert.equal(s.engagement.median_seconds_visible, 30);
  assert.equal(s.engagement.median_scroll_percent, 85);
  assert.deepEqual(s.reads.top_read_pages, [['/en/tours/x', 2, 2]]);
  assert.equal(s.reads.views_read, 2);
  assert.deepEqual(s.devices, [['m', 2], ['d', 1]]);
  assert.equal(s.web_vitals.lcp_ms.p50, 1800);
});

test('WhatsApp clicks are counted per page, section and visitor', async () => {
  const s = await report([
    row('A', '/en/tours/x', 'v', { vi: 'a1' }), row('C', '/en/tours/x', 'v', { vi: 'c1' }), row('D', '/ru/places/y', 'v', { vi: 'd1' }),
    row('A', '/en/tours/x', 'wa'), row('C', '/en/tours/x', 'wa'), row('C', '/en/tours/x', 'wa'),
  ]);
  assert.equal(s.whatsapp.clicks, 3);
  assert.equal(s.whatsapp.visitors, 2);
  assert.equal(s.whatsapp.visitor_share, 0.667);
  assert.deepEqual(s.whatsapp.by_page, [['/en/tours/x', 3]]);
  assert.deepEqual(s.whatsapp.by_section, [['tours', 3]]);
  assert.equal(s.visitors_with_contact_action, 2);
});

test('crawlers, internal traffic, foreign referers and rate-limited beacons are not visitors', async () => {
  const s = await report([
    row('A', '/en', 'v'),
    row('B', '/en', 'v', { traffic_class: 'claimed_crawler' }),
    row('C', '/en', 'v', { internal: true }),
    row('D', '/en', 'v', { referer: 'http://spam.example/' }),
    row('E', '/en', 'v', { status: 429, traffic_class: 'claimed_crawler' }),
  ]);
  assert.equal(s.views, 1);
  assert.equal(s.spoofed_or_foreign_referer, 1);
  assert.deepEqual(s.rejected, { '429:claimed_crawler': 1 });
});

test('beacons sent before the extra fields existed still count as views', async () => {
  const s = await report([row('A', '/en/places', undefined), { ...row('B', '/en/places', ''), ev: undefined }]);
  assert.equal(s.views, 2);
});

test('LCP by device uses the device named by the matching view beacon', async () => {
  const s = await report([
    row('A', '/en/places/x', 'v', { vi: 'a1', dev: 'm' }), row('A', '/en/places/x', 'l', { vi: 'a1', dev: '', dwell: '5', scroll: '10', lcp: '3000' }),
    row('B', '/en/places/x', 'v', { vi: 'b1', dev: 'd' }), row('B', '/en/places/x', 'l', { vi: 'b1', dev: '', dwell: '5', scroll: '10', lcp: '900' }),
  ]);
  assert.deepEqual(s.web_vitals.lcp_by_device.m, { n: 1, lcp_p75: 3000 });
  assert.deepEqual(s.web_vitals.lcp_by_device.d, { n: 1, lcp_p75: 900 });
});

test('a retried beacon is counted once; repeated leave beacons still merge', async () => {
  const s = await report([
    row('A', '/en/places/x', 'v', { vi: 'a1', q: '1' }), row('A', '/en/places/x', 'v', { vi: 'a1', q: '1' }),
    row('A', '/en/places/x', 'wa', { vi: 'a1', q: '2' }), row('A', '/en/places/x', 'wa', { vi: 'a1', q: '2' }), row('A', '/en/places/x', 'wa', { vi: 'a1', q: '3' }),
    row('A', '/en/places/x', 'l', { vi: 'a1', q: '4', dwell: '4', scroll: '10' }), row('A', '/en/places/x', 'l', { vi: 'a1', q: '4', dwell: '40', scroll: '80' }),
  ]);
  assert.equal(s.views, 1);
  assert.equal(s.whatsapp.clicks, 2);
  assert.equal(s.beacons_deduped, 2);
  assert.equal(s.reads.views_read, 1);
});

test('likely human, uncertain and bot views are kept apart', async () => {
  const s = await report([
    row('A', '/en', 'v', { fetch_site: 'same-origin' }),
    row('B', '/en', 'v', { fetch_site: '' }),                                  // header missing
    row('C', '/en', 'v', { fetch_site: 'cross-site' }),
    row('D', '/en', 'v', { fetch_site: 'same-origin', traffic_class: 'claimed_crawler' }),
    row('E', '/en', 'v', { fetch_site: 'same-origin', traffic_class: 'claimed_crawler' }),
    row('F', '/en', 'v', { fetch_site: 'same-origin', internal: true }),
    row('G', '/en', 'v'),                                                      // older log line: no fetch metadata field at all
  ]);
  assert.deepEqual(s.traffic, { views_likely_human: 2, views_uncertain: 2, views_bot: 2, bot_share: 0.333 });
  assert.equal(s.views, 2);
  assert.equal(s.visitors, 2);
});

test('engagement, the funnel by source and landing page, and script errors', async () => {
  const s = await report([
    row('A', '/en/tours/x', 'v', { vi: 'a1', q: '1', sess: '1', ref: 'google.com' }), row('A', '/en/tours/x', 'g', { vi: 'a1', q: '2' }), row('A', '/en/tours/x', 'wa', { vi: 'a1', q: '3' }),
    row('B', '/en/tours/x', 'v', { vi: 'b1', q: '1', sess: '1', ref: 'google.com' }), row('B', '/en/tours/x', 'g', { vi: 'b1', q: '2' }),
    row('C', '/en/places/y', 'v', { vi: 'c1', q: '1', sess: '1' }),
    row('D', '/en/places/y', 'v', { vi: 'd1', q: '1', sess: '1', utm_source: 'newsletter' }), row('D', '/en/places/y', 'x', { vi: 'd1', q: '2', eh: 'deadbeef' }),
    row('A', '/en/places/z', 'v', { vi: 'a2', q: '1' }),
  ]);
  assert.deepEqual(s.engaged, { views: 2, visitors: 2, rate: 0.4 });
  assert.deepEqual(s.funnel, { visitors: 4, engaged_visitors: 2, whatsapp_visitors: 1, contact_visitors: 1 });
  assert.deepEqual(s.funnel_by_source, [['google.com', 2, 2, 1], ['direct', 1, 0, 0], ['newsletter', 1, 0, 0]]);
  assert.deepEqual(s.funnel_by_page, [['/en/tours/x', 2, 2, 1], ['/en/places/y', 2, 0, 0]]);
  assert.deepEqual(s.js_errors, { count: 1, views_affected: 1, rate: 0.2, top: [['deadbeef /en/places/y', 1]] });
});

test('TTFB and LCP are broken down by connection, page type and element', async () => {
  const s = await report([
    row('A', '/en/tours/x', 'v', { vi: 'a1', conn: '4g' }), row('A', '/en/tours/x', 'l', { vi: 'a1', dwell: '5', scroll: '5', lcp: '2000', ttfb: '200', lt: 'i' }),
    row('B', '/en/tours/x', 'v', { vi: 'b1', conn: '3g' }), row('B', '/en/tours/x', 'l', { vi: 'b1', dwell: '5', scroll: '5', lcp: '4000', ttfb: '600', lt: 't' }),
  ]);
  assert.deepEqual(s.web_vitals.ttfb_ms, { n: 2, p50: 600, p75: 600 });
  assert.deepEqual(s.web_vitals_segments.connection, { '4g': { n: 1, lcp_p75: 2000 }, '3g': { n: 1, lcp_p75: 4000 } });
  assert.deepEqual(s.web_vitals_segments.section, { tours: { n: 2, lcp_p75: 4000 } });
  assert.deepEqual(s.web_vitals_segments.element, { i: { n: 1, lcp_p75: 2000 }, t: { n: 1, lcp_p75: 4000 } });
});
