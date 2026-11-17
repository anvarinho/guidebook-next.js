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
