# Administration

Implemented locally; production deployment and account operations require operator review.
The public website keeps its existing routes and appearance. Administration uses
the installed NextAuth 4.24.15, encrypted HttpOnly cookies and MongoDB-backed,
revocable sessions. No public registration or password-reset email is provided.
The library choice retains the maintained v4 line and its published security
fixes; see the [maintainer security update](https://better-auth.com/blog/security-update-july-2026).

## Configure production

Run commands from `/var/www/frontend` with the same Node 22+ runtime used by the `guidebook-frontend@3000` service.
Keep these values in the ignored `.env.local` or the deployment secret manager:

```dotenv
NEXTAUTH_URL=https://central-asia.live
NEXTAUTH_SECRET=<fresh random secret with at least 32 characters>
ADMIN_MONGODB_URI=<authenticated MongoDB connection URI>
DB_NAME=<database containing your existing users and content>
```

Generate a secret locally with `openssl rand -hex 32`; do not commit it. Preserve
existing production secrets. DB_HOST/DB_PORT remains a local compatibility fallback.
Verify that the selected database is also the database used by the content API
before enabling content editing. Public pages may retain content for up to the
backend's cache lifetime; Next.js detail/list caches are invalidated after saves.

`npm run admin:check` reports configuration presence/validity without values.
It does not establish database connectivity or permissions.
`npm run admin:check -- --routes` additionally checks the public CSRF endpoint
without printing its token. This must return PASS after deployment.

The read-only production check on 2026-10-30 found public `/api/auth/csrf` returning
404 while direct Next.js returned 503. Review [deploy/nginx-admin.conf](../deploy/nginx-admin.conf)
and include its location block inside the existing HTTPS server. It routes only
authentication to Next.js on port 3000; leave the backend `/api` location intact.
Run `nginx -t` before reloading Nginx. No live configuration has been changed.

MongoDB permissions: find/insert/update/createIndex on users; find/insert/remove/
createIndex on admin_sessions; find/insert/update/createIndex on admin_login_limits;
find/update on places, tours, articles. Counts use find
permission. Provision authenticated access and acknowledged journaled majority writes.
Before unique user indexes are created, resolve existing duplicates through a
separate reviewed operation; these tools never delete duplicate records.

After review, run lint, tests and build with the real production environment,
then `systemctl restart guidebook-frontend@3000` so the new environment is read.
Keep the working directory `/var/www/frontend`. Test login, logout, and an
authorized edit on staging before applying production account/data changes.

## Create or reset an administrator

These commands intentionally write the chosen account. Run only when authorized:

```bash
cd /var/www/frontend
npm run admin:account -- create admin@example.com adminname
# Existing active administrator; leaves email, role and status unchanged:
npm run admin:account -- reset anvarinho@gmail.com
```

Both commands prompt twice for a hidden password in an interactive terminal. Use
12+ characters and at most 72 UTF-8 bytes. Passwords never appear in arguments,
logs or output. `create` refuses existing email/username accounts; `reset` refuses
inactive accounts and non-admins, and does not grant roles. Existing bcrypt hashes
continue to work. A reset invalidates existing sessions through their stored
password fingerprint. No default admin is created by installation or tests.

Open `https://central-asia.live/login`, enter the account email and chosen password,
then use `/admin`. Login errors intentionally do not identify whether an account
exists. Missing configuration and storage failures also fail closed.

## Security and interface behavior

- Sessions expire after eight hours, revoke on logout, and re-check active/admin
  flags and the password fingerprint on protected access.
- Every admin data reader and mutation authorizes independently of the layout.
  Mutations allowlist fields and validate lengths/types. The UI cannot demote or
  deactivate the signed-in administrator. Password changes use the operator CLI.
- NextAuth supplies CSRF protection for credentials/signout; Next.js Server Actions
  retain their origin checks. Keep proxy Host and forwarded protocol accurate.
- Login budgets are persisted atomically: 10 attempts per normalized email and
  120 globally per 15-minute fixed window. An optional trusted IP budget is 30.
  Counters expire via TTL and store HMAC identities, not raw emails or IPs. Database
  failures deny login; counters do not reset on successful login or app restart.
  Shared budgets deliberately trade availability during attacks for bounded work.
- Leave ADMIN_TRUSTED_IP_HEADER blank unless ingress overwrites that header and
  direct access to Next.js is blocked. Never trust arbitrary X-Forwarded-For.
  When using the reviewed Nginx fragment and restricted ingress, set it to
  `x-admin-client-ip`; configure any CDN real-IP trust separately.
- Lists load 20 projected records per page. Overview cards show actual collection counts. Content editing preserves
  untranslated values, paragraph images/links, URLs and unrelated fields.
- Native modal navigation supports Escape, focus trapping/restoration and active
  links. Forms have labels, pending feedback and visible errors. Reduced motion
  is respected. No analytics charts or financial metrics are fabricated.

## Editorial overview

See [admin.md#overview-metrics](admin.md#overview-metrics) for metric definitions, query budgets,
server filters, editor previews, index review and verification of the editorial
workspace redesign. It requires no new environment variables or permissions.

## Verification

`npm test` covers guards, forged/expired tokens, revocation, changed roles/passwords,
CSRF, durable writes, allowlists, limiter concurrency/reloads and operator resets.
`npm run test:e2e` requires `mongod`, Rust and Playwright Chromium. It launches a
temporary local MongoDB (4330), readiness server (4331), content API (4329), and
production Next.js server (3217). All accounts are synthetic; no production
credentials or databases are used. The temporary database is removed on shutdown.
Browser tests cover real login/logout, blocked attempts, reset invalidation,
search/pagination, saved edits, mobile overflow and keyboard navigation, plus public
page regressions. Never run the fixture server exposed to a public network.

For repeatable Linux CPU/RSS measurements:

```bash
rustc scripts/admin-benchmark.rs -o /tmp/admin-benchmark
# Start the production build on localhost:3218, obtain the Node PID, then:
/tmp/admin-benchmark NODE_PID 3218
```

This sends five warmup and 50 measured GET /login requests. It measures Node CPU
time and process RSS, not browser rendering, bcrypt throughput, database memory or
production load. See performance.md for the measured before/after results.


## Overview metrics

Implemented locally; not deployed. No production reads, data writes, account
changes, indexes, or migrations were performed for this redesign. Authentication,
session expiry/revocation, login budgets and operator account tools are preserved.
No new packages or environment variables are required.

## Metrics and source records

The overview reads the content collections directly. The admin no longer shows
traffic or response statistics: the Rust backend's `statistics` collection and its
`stats-ingest` job were removed, and traffic figures now come from the nginx access
log (including the `POST /rum` real-user beacon).

| Display | Calculation and scope |
| --- | --- |
| Collection cards | Current document counts for places, tours, articles and users. Not publication counts: the data has no verified publication-status field. |
| English checklist | Required nonblank English text plus a nonblank image path. Places: name/title/description. Tours: title/description. Articles: title and text in every paragraph, at least one paragraph. Not editorial approval or image URL availability. |
| Translation matrix | Same editorial text checks per locale, without the image requirement. Plain strings count only for English. No fallback English is counted as a translation. |
| Stored view leaders | Existing cumulative nonnegative integer viewCount counters, independent of date filters. Not unique visitors or business conversions. |
| Recently updated | Existing BSON Date updatedAt values, newest first; no inferred edits from creation dates/ObjectIds. No editor names or audit events are invented. |
| Team access | Boolean isActive/isAdmin flags. “Active administrators” requires both flags true. |

## Functional changes

Search, state/language filters, allowlisted sorting and 20-record pagination run
on the server and persist in URL parameters. Pagination keeps all active filters.
Content sorts support newest/oldest, name, stored views and updatedAt; users
sort by ID/name. Every sort has a deterministic ID tie-breaker.

Editors show saved translation coverage, English field checks and saved public
page links. Body previews call an authorized Server Action and use the same
server sanitizer as public content; parser/sanitizer code is not sent to browsers.
Preview does not save. Controlled fields preserve input after a failed save.

Unsaved changes are kept in component memory. Navigation through links, other
forms, reload/tab close receives a warning. Supporting browsers also intercept
history traversals with the Navigation API; older browsers retain beforeunload
for document exits, but may not warn on every client-side history traversal.
No drafts, passwords, or private records are written to localStorage.

No destructive bulk actions or new audit system were added. Existing updatedAt
records are sufficient for a truthful recent-updates list; a future audit trail
would need its own permissions, retention and reviewed migration.

## Query budgets and privacy

The overview is server-rendered, does not poll, and does not put private results
in a shared/public cache. Every DAL entry point authorizes before DB access.
Aggregations have maxTimeMS 5000 and allowDiskUse false. Lists return 20 projected
records. No passwords, session handles, IPs or user agents are sent to
overview components.

Content checks inspect at most 10,001 records per collection. Above 10,000, exact
counts use the ID index while partial coverage/rankings/update samples are hidden.
Large
content/checklist queries should be redesigned around reviewed materialized
metadata before increasing these budgets.

## Index review — do not apply automatically

No production index changes are required or applied by this implementation.
Review query plans and write overhead on staging before considering:

- places/tours/articles `{viewCount:-1,_id:-1}` and `{updatedAt:-1,_id:-1}` for
  corresponding list sorts. These do not eliminate editorial coverage scans.
- users `{isActive:1,isAdmin:1,_id:-1}` if access-filter queries warrant it.

Computed translation/readiness/name expressions can still scan matching records.
Additional indexes alone do not solve that. Any materialized-field backfill,
audit collection, retention change or MongoDB role change needs a separate review.
Existing frontend collection permissions are sufficient; no new roles are needed.

## Verification and previews

Run `npm run lint`, `npm test`, and `npm run test:e2e`. Browser checks use a temporary
MongoDB, synthetic counter windows and a local content API. They cover real
login/logout and revocation, exact leap-day boundaries, mixed legacy/v2 totals,
unsupported records, privacy, empty periods, sorting/filter drilldowns, retained
pagination, sanitized previews, preserved failed-save input and unsaved warnings.
Public-page regressions continue to run. Screenshots are written under
`test-results/` (ignored by Git). See performance.md for workload measurements.
