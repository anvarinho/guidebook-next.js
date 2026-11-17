# Operations

The incident combined a growing Next.js runtime route cache (2.6 GiB) with a
58,982,453-byte sitemap response. All 50 localized versions repeated all 51
language alternates. One cached sitemap request caused a large memory burst;
the production logs also recorded repeated JavaScript heap exhaustion.

## Application changes

`/sitemap.xml` is now a 4,222-byte sitemap index. Language shards live at
`/sitemaps/sitemap/en-0.xml`, etc. Each shard contains at most 500 URLs; more
content creates additional shards. The current production dataset retains all
10,400 URLs and every language alternate across 50 shards, with a maximum
response body of 1,179,799 bytes. Sitemap fetches and responses revalidate hourly.
Visible content pages retain their existing 60-second revalidation.

The image optimizer has a native 256 MiB disk budget. Node retains its 384 MiB
old-space limit (the systemd unit sets 256 MiB; MemoryHigh 320 MiB and MemoryMax
400 MiB bound the whole process) and listens on 127.0.0.1:3000 so requests pass
through Nginx.

## Scheduled runtime-cache budgets

`scripts/cache-budget.rs` preserves Next.js's built-in cache format. The
`guidebook-cache-budget.timer` runs it every five minutes at low CPU/I/O priority.

| Runtime directory under `.next-build` | High water | Trim target | Maximum entries | Unused age |
| --- | ---: | ---: | ---: | ---: |
| `server/route-cache` | 768 MiB | 512 MiB | 6,000 | 3 days |
| `cache/fetch-cache` | 128 MiB | 96 MiB | 4,096 | 1 day |
| `cache/images` | 256 MiB | 192 MiB | 4,096 | 7 days |

These are periodic budgets, not filesystem quotas: caches can exceed a high-water
mark between runs. Recent writes are skipped for 60 seconds. Whole route entries
(HTML/body, metadata, RSC and segments) are grouped for eviction. The tool also
removes empty cache directories, refuses symlinks, and checks for concurrent
refreshes. Immutable build seeds under `server/app` are preserved. Evicted entries
regenerate when requested.

```sh
/usr/local/sbin/guidebook-cache-budget /var/www/frontend # dry run
systemctl status guidebook-cache-budget.timer
journalctl -u guidebook-cache-budget.service -n 20
```

The first cleanup consumed 9.46 CPU seconds while removing the accumulated
backlog. The following scheduled run consumed 1.64 CPU seconds (4.38 seconds
wall time), about 0.55% of one CPU averaged over five minutes.

## Request controls

### Malformed content URLs

`src/lib/contentSlug.ts` shares the Rust API's lowercase ASCII, hyphenated,
200-character slug contract across place, tour, and article loaders. Invalid
slugs resolve as missing content without fetching the API; the existing page
and metadata handlers use `notFound()`. Genuine upstream failures still throw.

For immediate protection before a frontend rebuild, install
`deploy/nginx-content-slugs.conf` as
`/etc/nginx/conf.d/guidebook-content-slugs.conf` and
`deploy/nginx-content-slug-guard.conf` as
`/etc/nginx/snippets/guidebook-content-slug-guard.conf`. Include the latter
inside the public frontend `location /`, as shown in
`deploy/nginx-public-proxy.conf`. Validate with `nginx -t` before reloading.
The guard checks normalized paths, ignores query strings, and returns 404
without contacting Next.js for malformed localized content-detail URLs. API,
authentication, assets, and listing routes retain their existing handling.
The map covers two-letter locales and `fil`; update it when adding other
three-letter locale codes. An optional trailing slash is allowed.

Known tour slugs followed by a space and booking text are recovered before
the invalid-slug guard: a temporary 302 opens WhatsApp at `996500490806` with
a clean message containing the canonical tour URL. Percent-encoded and multiply
encoded spaces are supported. The original suffix and query string are not
forwarded. Unknown tour slugs, invalid place/article paths, and file-like paths
still return 404. Keep the booking map's explicit tour allowlist synchronized
with published slugs. This redirect opens a chat; it does not send a message.

The edge guard is effective immediately after reload. Loader source changes
require the next frontend build to protect direct Node requests as well.

`deploy/nginx-resource-limits.conf` is installed in Nginx's `http` context;
`deploy/nginx-public-proxy.conf` replaces the canonical HTTPS server's public
proxy location. Existing backend and authentication locations are preserved.

- Heavy crawler identities share 12 HTML requests/minute across their IPs,
  burst 3. Other crawler user agents receive the same rate per IP.
- Google, Bing, DuckDuckGo and Apple crawler agents receive 60/minute per IP,
  burst 10. Ordinary page requests receive 5/second per IP, burst 20.
- HTML requests have 4 concurrent requests per IP and 6 overall. Static assets
  are excluded. Image optimization receives 4/second per IP, burst 24.
- Sitemap endpoints share 12/minute, burst 4, and one concurrent request.
- Excess requests return 429 with `Retry-After: 5`. User-agent limits are
  supplemented by per-IP and shared concurrency limits.

Validation demonstrated crawler responses `200,200,200,200,429,429`, followed by
200 responses for an ordinary browser, Googlebot and a static asset.

## Measurements and validation

A local cold Node 26.10.0 process with a 384 MiB old-space limit served the
production sitemap data before and after. CPU is process user+system time from
`/proc`; RSS is the process high-water mark. The original request contained the
whole sitemap; the final workload fetched the index and all 50 shards, covering
the same 10,400 URLs. `scripts/sitemap-benchmark.rs` drains responses without
holding their bodies in the benchmark process.

| Complete sitemap discovery | Before | After |
| --- | ---: | ---: |
| Requests | 1 | 51 |
| Node CPU | 740 ms | 890 ms |
| Peak Node RSS | 345.8 MiB | 163.7 MiB |
| Transferred bytes, including HTTP framing | 58,983,064 | 59,025,205 |

Splitting spreads allocations across smaller responses. The extra requests
increased CPU in this single-pair sample; no overall CPU reduction is claimed.
The live server uses Node 24, and live traffic differs from this local workload.

Validation: 98 regression tests, 25 browser checks, TypeScript, ESLint, production
builds, seven Rust safety/eviction tests, Nginx syntax checks and a candidate
release smoke test on the server's Node 24 runtime. Browser checks cover all
50 sitemap shards, invalid IDs, localized pages and existing navigation behavior.

Allocation sampling (`scripts/heap-sample.mjs`) records stacks and aggregate
memory statistics rather than a full heap snapshot. Its inspector binds only to
loopback and is closed at the end. In the three-minute live sample after
deployment, heap usage ranged from 51.1 to 63.5 MiB. The largest sampled retained
allocations were in Next.js revalidation caches and translation-module loading.
No restart occurred in the observation window. Samples do not establish long-term
leak freedom. Live place, tour and article details, login/provider endpoints and
WebP optimization returned 200; the temporary server and inspector ports closed.
Final disk usage was 65%, with 8.3 GiB available. The earlier deployment also retained diagnostic artifacts; compiled rollback
copies have since been removed during storage cleanup.

## Real-user beacons

`RealUserBeacon` posts small beacons to `/rum` (the route returns 204 and stores nothing).
nginx logs their query fields after validating each one by pattern, so unknown values are
logged as empty. The field list lives in `src/lib/rum.ts` and in the `guidebook_rum_*` maps
of `/etc/nginx/conf.d/guidebook-observability.conf`; keep the two in step.

| Beacon | When | Fields |
| --- | --- | --- |
| view (`e=v`) | Page visible for one second, once per page view | `p` page, `vi` view id, `d` device (m/t/d), `c` connection, `n=1` first ever visit, `s=1` session start (with `ref`/`utm_*`) |
| leave (`e=l`) | Tab hidden or page navigated away | `vi`, `t` seconds visible, `sd` deepest scroll %, and for full page loads `lcp` ms, `cls` x1000, `inp` ms |
| interaction | Click | `e=wa`, `tel`, `mail`, `contact`, `lang`, `more` or `form` (contact form sent) |

A leave can repeat for one view (tab hidden twice), so reports keep the largest values per
`vi`. Crawlers that run JavaScript (Meta's, for one) also send beacons; they are rate limited
by the crawler zone and are separated by `traffic_class`, so they are not counted as visitors.

`scripts/rum-report.mjs` (plain Node, no dependencies; run it from the frontend directory with
the server's Node) prints a report for a window of the nginx log: `--hours 24`,
`--date YYYY-MM-DD`, `--json`. It shows views, visitors, devices, which pages get *read* (scroll of
at least 70% and 20 seconds visible), WhatsApp clicks by page, section and language, and web vitals.

## Traffic statistics database

`scripts/traffic-stats.mjs` turns the nginx access logs into one SQLite file,
`/var/lib/guidebook-stats/stats.sqlite`, with a set of rows per UTC day. It uses Node's built-in
`node:sqlite`, so it needs no packages. `deploy/guidebook-traffic-stats.cron` runs it nightly at
02:10 UTC. Re-running replaces the days it reads and leaves older days alone, so history survives
the log rotation (90 files, about 90 days) indefinitely. Only complete days are stored.
Requests come from the log; real-user numbers use the same code as `rum-report.mjs`.

| Table | One row per | Holds |
| --- | --- | --- |
| `days` | day | requests, bytes, p50/p95/p99 latency, browser vs crawler vs unclassified, pages / assets / images / API / beacons, status groups (ok, redirects, 404, 429, other 4xx, 5xx), views, visitors, new visitors, sessions, single-view visitors, reads, median dwell and scroll, contact and WhatsApp numbers |
| `hourly` | day and hour | requests, crawler requests, 429s, 5xx and real views: shows spikes and deploy errors |
| `breakdown` | day, `dim`, `key` | `requests` (from the log) and `views` (beacons) by `country`, `status`, `language`, `section`, `device`, `connection`, `referrer`, `utm_source` |
| `pages` | day and page | views, reads and WhatsApp clicks per page |
| `events` | day and event | clicks and distinct visitors for `wa`, `tel`, `mail`, `contact`, `lang`, `more`, `form` |
| `vitals` | day, device, metric | LCP, CLS (x1000) and INP: sample size, median and 75th percentile |
| `bots` | day and IP | the heaviest clients (300+ requests a day, at most 15) with country and user agent, kept 180 days. Ordinary visitors never reach this table |

Ready-made views: `v_overview` (one line per day with ratios), `v_weekly` and `v_top_pages_7d`.
Print the latest days with `node scripts/traffic-stats.mjs --show 14`, or query directly:

```sh
sqlite3 -header -column /var/lib/guidebook-stats/stats.sqlite "SELECT * FROM v_overview ORDER BY date DESC LIMIT 7"
sqlite3 -header -column /var/lib/guidebook-stats/stats.sqlite "SELECT hour, requests, server_errors FROM hourly WHERE date = '2026-11-15'"
```

Notes: days before about Nov 4 come from the old log format (`source = legacy`) and have no crawler
split or beacon data (those columns are NULL). `browser_pages` is the old "human page view" count
and includes bots that pose as browsers; use `views` and `visitors` for real people. A version 1
database (table `daily`) is refused with instructions: move it aside and run the script again to
rebuild it from the logs that still exist.

## Production layout and deployment

The application runs directly from `/var/www/frontend`. Its production output
is the real directory `.next-build/`, served by the systemd template unit `guidebook-frontend@3000` (`deploy/guidebook-frontend@.service`).
There is no `current` link or `releases/` directory. Cache maintenance targets
the project root. Runtime state, logs and database backups live outside Git.

Use the Node version required by package.json for installation and builds. Stop
the frontend and cache timer before replacing the production build in this flat
layout; installing or building over the running directory can remove active
files. Build and dependencies must use the same package-lock.json. Start the
application with `systemctl start guidebook-frontend@3000` (the unit re-owns
`.next-build` on start), verify the public site and authentication, then resume
cache maintenance. Logs: `journalctl -u guidebook-frontend@3000`.

The November 1 build.before copies described by the historical incident were
removed during storage cleanup and cannot be used for rollback. Preserve
appropriate source and database backups before future deployments. The
measurements above describe the original incident, not current live CPU/RSS.

## Server monitoring and backups

The health timer records deduplicated threshold events in
`/var/log/guidebook-health/alerts.jsonl` and the system journal. Directory size
snapshots are recorded daily in `directory-sizes.jsonl`; MongoDB size is sampled
hourly and compared with a 24-hour baseline. Local warning thresholds are 85%
root-disk use, less than 10% available memory, 85% swap use, three frontend restarts
within 15 minutes, and at least five or 5% HTTP 5xx responses in five minutes.
MongoDB growth alerts at the larger of 100 MiB or 25% per day.

Daily database backups are stored in `/var/backups/guidebook/mongodb/`, with the
14 newest archives retained. The backup service reads the MongoDB URI from the
running API process and writes it only to a mode-0600 temporary config file.
The configured alerts are local; set `GUIDEBOOK_ALERT_EMAIL` in the health
service environment to send mail if a local mail transport is configured.

Useful commands:

```sh
journalctl -t guidebook-health --since today
tail -n 20 /var/log/guidebook-health/alerts.jsonl
tail -n 40 /var/log/guidebook-health/directory-sizes.jsonl
systemctl list-timers 'guidebook-*'
systemctl status guidebook-mongodb-backup.service
```
