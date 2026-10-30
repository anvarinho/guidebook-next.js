# Administration

Implemented locally; production deployment and account operations require operator review.
The public website keeps its existing routes and appearance. Administration uses
the installed NextAuth 4.24.15, encrypted HttpOnly cookies and MongoDB-backed,
revocable sessions. No public registration or password-reset email is provided.
The library choice retains the maintained v4 line and its published security
fixes; see the [maintainer security update](https://better-auth.com/blog/security-update-july-2026).

## Configure production

Run commands from `/var/www/frontend` with the same Node 22+ runtime used by PM2.
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
404 while direct Next.js returned 503. Review [deploy/nginx-admin.conf](deploy/nginx-admin.conf)
and include its location block inside the existing HTTPS server. It routes only
authentication to Next.js on port 3000; leave the backend `/api` location intact.
Run `nginx -t` before reloading Nginx. No live configuration has been changed.

MongoDB permissions: find/insert/update/createIndex on users; find/insert/remove/
createIndex on admin_sessions; find/insert/update/createIndex on admin_login_limits;
find/update on places, tours, articles; and find on statistics. Counts use find
permission. Provision authenticated access and acknowledged journaled majority writes.
Before unique user indexes are created, resolve existing duplicates through a
separate reviewed operation; these tools never delete duplicate records.

After review, run lint, tests and build with the real production environment,
then `pm2 restart frontend --update-env` using the installed PM2 Node runtime.
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
- Lists load 20 projected records per page; reports omit stored IP/user-agent
  details. Overview cards show actual collection counts. Content editing preserves
  untranslated values, paragraph images/links, URLs and unrelated fields.
- Native modal navigation supports Escape, focus trapping/restoration and active
  links. Forms have labels, pending feedback and visible errors. Reduced motion
  is respected. No analytics charts or financial metrics are fabricated.

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
production load. See PERFORMANCE.md for the measured before/after results.
