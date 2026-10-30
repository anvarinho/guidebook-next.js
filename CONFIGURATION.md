# Configuration and deployment after stabilization

## Release verification

Public place, tour, and article detail routes now generate on first visit and reuse the full rendered page for 60 seconds, rather than repeating React/Markdown work for every visitor. Revalidation happens in the background; a backend failure preserves an existing successful page. The first request for an uncached slug still depends on the backend, and missing content remains a 404. Admin, authentication, contact submissions, and language-preference redirects remain dynamic/private.

The production Next.js memory cache is limited to 16 MiB (disk caching remains enabled). PM2 runs one frontend process with a 256 MiB V8 old-space limit and a 512 MiB RSS restart threshold. These limits leave headroom on the current 1 GiB server; the V8 limit is not a total process-memory limit, and PM2 checks memory periodically. Monitor restarts and RSS under real traffic, and adjust on larger hosts if needed. Rebuilds should run in an isolated directory, with a verified release switched into `/var/www/frontend` only after smoke checks.

Run `npm run lint`, `npm test`, and `npm run test:e2e` before release. Browser checks build against an isolated local fixture API and verify canonical URLs, production headers, admin access rejection, reduced motion, and contact failure feedback without production credentials. Rust and Playwright Chromium are required for those checks.

For the actual deployment, set `CONTENT_API_URL` in the hosting environment **before** `npm run build`; an ignored developer `.env.local` is not shipped by Git. The content API must be reachable during prerendering. Restart `npm run dev` after changing local environment configuration. Build with `npm run build`, then serve with `npm start`; retain the `.next-build` output and required runtime dependencies/assets.

For PM2 deployments, activate Node 22+ (CI uses Node 24), then run `npm ci` and `npm run build` in the same release directory. The build and `node_modules` must come from the same lockfile; copying a new build over old dependencies can cause missing external-module errors on dynamically rendered pages. Start or reload `ecosystem.config.js` with `--env production`, then run `pm2 save`. The process configuration uses the invoking Node runtime, a fixed release directory, and disables file watching. Verify a place detail page as well as prerendered listings before replacing the previous release; keep that release for rollback.

The application sends `nosniff`, a cross-origin referrer policy, same-origin framing restrictions, and permissions restrictions. Its CSP restricts objects, base URLs, and framing; it does not yet restrict script sources. It preserves existing inline artwork, external maps, analytics, and static rendering. Production responses enable one year of HSTS for the current hostname only; terminate TLS at the ingress and redirect HTTP to HTTPS there. Do not cache authenticated pages, `/api/auth/*`, or contact submissions at the CDN. Verify these response headers after ingress/CDN configuration, since intermediaries may override them.

Public builds do not establish that administration or contact storage is provisioned. Before launch, configure and verify the admin database, HTTPS `NEXTAUTH_URL`, and strong `NEXTAUTH_SECRET` below. Provision the dedicated contact inbox and assign a staff owner following `CONTACT.md`. Exercise both integrations on isolated staging. Credentials previously committed to Git require rotation through their providers; ignoring a local file does not revoke old credentials. No production database writes or credential rotation are performed by the test suite.

Copy the non-secret `.env.example` to an ignored local file, or set variables in your deployment's secret manager. Never commit populated environment files. `NEXT_PUBLIC_*` values are public build-time image/contact configuration, not backend credentials.

## Site, API, and assets are separate

- `SITE_URL`: canonical public origin. Defaults to `https://central-asia.live`, preserving existing production canonical/hreflang output. Use your staging origin for a separate staging site. Never set it to a private API host.
- `CONTENT_API_URL`: **required, server-only** content backend origin without `/api`; an optional base path is supported. No embedded credentials, query, or fragment. There is no implicit production fallback. Supply a reachable backend for normal builds and content pages.
- `CONTENT_API_TIMEOUT_MS`: positive integer up to 60000; default 10000. Covers headers and JSON body consumption. Transport/validation failures are errors, not missing pages; only detail HTTP 404 becomes a not-found page.
- `NEXT_PUBLIC_URL`: retained for compatibility as the public **image/asset** origin only. Empty means same-origin asset paths. Set to `https://central-asia.live` for existing production uploads. If you change image hosts, explicitly review Next's `images.remotePatterns`; do not enable unrestricted/private-IP image fetching.

Content payloads are validated against `src/lib/contentSchemas.ts`, based on observed public API shapes. List/detail schemas differ where the actual backend differs. Unknown transport fields are stripped. Types derive from those schemas. Public content retains 60-second revalidation; sitemap retains its existing behavior. An abort signal supplies a timeout; React request caching restores render-pass deduplication for metadata and page loaders.

Local: `SITE_URL=http://localhost:3000`, `CONTENT_API_URL=http://localhost:4000`, empty `NEXT_PUBLIC_URL`, and your own local backend. Staging: isolated staging backend/database, staging canonical and asset origins, never production database credentials. Production: `SITE_URL=https://central-asia.live`, the actual backend origin in `CONTENT_API_URL`, and the existing public asset origin. Configure public build-time settings **before** building.

The existing image placeholder generator remains opt-in. Its `--remote` mode reads the existing public asset/content origin; do not run it against a private backend or change generated artwork as part of a deployment check.

## Administration

Authentication is consolidated on the installed NextAuth v4 credentials provider and `/api/auth/*`. The previous browser-created `token`, `isAdmin`, and `userID` cookies are ignored. Existing sessions must sign in again.

Required server configuration:

- `NEXTAUTH_URL`: actual application origin; HTTPS is mandatory in production.
- `NEXTAUTH_SECRET`: fresh high-entropy secret, at least 32 characters, identical on every application instance. Generate/store it through your secret manager. Never log it or use an example/test value. Rotate and restart all instances to invalidate existing encrypted cookies.
- `ADMIN_MONGODB_URI`: preferred authenticated TLS MongoDB URI from your secret manager.
- `DB_NAME`: explicit admin database name. Legacy `DB_HOST`/`DB_PORT` remains supported only when `ADMIN_MONGODB_URI` is empty; use that fallback only on a trusted local connection.

Before enabling admin, an authorized operator must verify the existing `users` collection has the intended administrator with **boolean** `isAdmin: true`, `isActive: true`, a normalized lowercase email, and an existing bcrypt password hash. Do not grant roles based on browser cookies. This change does not create a bootstrap administrator or modify existing users. Inspect existing duplicate emails/usernames before enabling user creation; it establishes unique indexes and fails safely rather than deleting duplicates. New passwords require at least 12 characters and at most 72 UTF-8 bytes and use bcrypt cost 12. Existing valid bcrypt hashes are still checked.

The app creates an `admin_sessions` TTL index on `expiresAt` (expireAfterSeconds 0). Grant the app `find/insert/remove/createIndex` on `admin_sessions`, and appropriate `find/insert/createIndex` on `users`; grant read-only access to content/statistics collections used by admin. Restrict network access, authenticate the MongoDB user, use TLS and journaled majority writes. Session creation and revocation require acknowledged majority+journal writes; the application will not claim logout succeeded when revocation fails. Provision these permissions on isolated staging first.

Sessions are bounded to eight hours in both NextAuth and persisted records. Server checks re-read current active/admin flags and a password fingerprint. Deactivation, demotion, password changes, expiry, or persisted revocation invalidate access. Only a currently active administrator may create users or assign admin privileges. Hashes and session handles are never included in the session/user DTO returned to clients. HTTP-only SameSite=Lax cookies are server-owned and Secure in production. Logout revokes the persisted handle before clearing cookies. No privileged action relies on a layout redirect alone.

The code does not add a CAPTCHA/MFA provider. Keep `/api/auth/*` behind ingress request-size and login-attempt rate limits; use restricted administrative access and monitoring appropriate to the deployment. Test configured login/logout and database permissions on staging before rollout. No real user login or production database writes were performed during local verification.

## Contact inbox

See [CONTACT.md](CONTACT.md) for exact MongoDB collections, indexes, least-privilege permissions, proxy/IP-header requirements, retention, and staff review operations. Required: `CONTACT_MONGODB_URI`, `CONTACT_MONGODB_DATABASE`, `CONTACT_ORIGIN`, `CONTACT_RATE_LIMIT_SECRET`. Configure `CONTACT_TRUSTED_IP_HEADER` only behind an ingress that overwrites it and prevents direct access.

This implementation stores enquiries durably; it **does not send email or notifications**. Assign an inbox owner and review schedule. Success means majority+journal acknowledged storage. Without configuration the form retains the enquiry and explicitly reports that receipt could not be confirmed. It never falls back to opening a mail draft. Existing explicit mail/phone/WhatsApp links remain direct contact alternatives.

## Language redirect and caches

`/` returns a 307 to an allowlisted saved `lang` cookie, otherwise `/en`, with `Cache-Control: private, no-store, max-age=0` and `Vary: Cookie`. Explicit localized URLs are unchanged. Keep `/` out of shared CDN caches and purge any previously cached permanent root redirect. Browsers that already cached the historic 308 may require cache clearing; the server cannot recall a redirect a browser serves without making a request.

## Credential remediation

The tracked `.env` has been removed from the Git index while preserving the local file. Ignore rules cover `.env` and `.env.*`, except `.env.example`. No history rewrite or external rotation was performed. The current file's populated credential categories were checked without printing values; no populated secret categories were identified. This does not establish that historical revisions, forks, CI logs, or old deployments never contained credentials.

An authorized owner should review those sources privately. If found, rotate the affected authentication/session signing keys, database credentials, email/API tokens, and map-provider credentials; restrict exposed map keys by origin/API as appropriate. Public site URLs, contact emails, phone numbers and analytics identifiers are not session secrets. Do not paste historical values into issues, chat, scripts, fixtures, or commits.

## Verification and CI without production secrets

Use `npm ci`, `npm run lint`, `npm test`. TypeScript 6 is pinned to match typescript-eslint and the existing compiler-API test harness. CI uses Node 24 and the lockfile. Lint warnings in unrelated legacy files remain visible, not suppressed.

For the full credential-free check, install stable Rust and run `npx playwright install chromium`, then `npm run test:e2e`. Playwright starts a tiny Rust fixture API on loopback port 4329, executes a real production build, starts production Next on loopback port 3217, and runs browser smoke tests. It never reuses an existing server. All database/contact credentials are explicitly empty; server content requests use test fixtures and browser external requests are blocked. Do not run this concurrently with a dev/build process using the same output directories. Synthetic content is test-only, never a production fallback. The current ImageSlider has no public route caller, so its actual component is bundled into an isolated browser harness (only next/image is substituted there), not exposed as a production test route. Public page smoke tests use real Next image rendering.

CI runs lint, unit tests, and that fixture-backed production build/browser check. It requires no production secrets or database access. Deployment acceptance against real auth/contact MongoDB, replication/TTL settings, ingress rate limits and inbox operations remains an operator staging task. No performance optimization is claimed by this hardening pass; existing asset conversions, caching and lazy-loading behavior are retained.
