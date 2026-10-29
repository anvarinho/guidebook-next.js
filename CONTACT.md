# Contact submission: provisioning and operations

## Delivery contract

`POST /api/contact` uses **durable MongoDB inbox storage**, not email. There was no configured email transport in this repository; existing MongoDB dependencies are reused with a dedicated least-privilege connection, separate from admin. No Resend/SMTP account is needed. There is no automatic email notification or public inbox reader.

A `201 {"ok":true}` is returned only after MongoDB acknowledges an insertion with `w: "majority", j: true`. Success means **saved for staff review**, not emailed or read. An unconfigured service, unavailable limiter/database, or unacknowledged write returns `503`; the form retains the visitor's text and never opens a mail draft. Existing explicit email/phone links remain separate direct contact options. A network interruption after a successful insert can leave the browser unable to confirm receipt; retries can create duplicates. Do not interpret a timeout as proof of non-delivery.

## Server environment

Set these in the deployment's **server secret/environment configuration**, never in `NEXT_PUBLIC_*`, source control, client code or CI test credentials:

| Variable | Required | Value |
| --- | --- | --- |
| `CONTACT_MONGODB_URI` | yes | Dedicated MongoDB URI with authentication and TLS; use an Atlas cluster or managed replica set with journaling and majority writes. |
| `CONTACT_MONGODB_DATABASE` | yes | Dedicated database, e.g. `guidebook_contact` (letters, digits, `_` and `-` only). |
| `CONTACT_ORIGIN` | yes | Exact public origin, e.g. `https://example.com`; no trailing slash/path. Canonicalize alternate hosts at the proxy. Local development uses `http://localhost:3000`. |
| `CONTACT_RATE_LIMIT_SECRET` | yes | Random secret of at least 32 characters, identical on every application instance; generate offline with `openssl rand -hex 32`. Rotation resets per-address buckets. |
| `CONTACT_TRUSTED_IP_HEADER` | optional | Lowercase header containing exactly one IP, **overwritten by your trusted ingress**. Leave unset unless that guarantee is verified. |

These settings are intentionally independent of `DB_HOST`, `DB_PORT`, and `DB_NAME`. There is no implicit connection to the content/admin database. All application instances must share this contact database and secret. Restart application workers after configuration/secret changes.

## Provision MongoDB before enabling the form

1. Create an Atlas cluster or managed replica set. Restrict network access to application egress addresses and approved operator machines. Require TLS and authentication; use backups/encryption at rest. Do not point development or CI at this deployment.
2. Connect an operator/admin `mongosh` session through your secret manager (do not paste credentials into repository files or command history). In that session run:

```javascript
use guidebook_contact

db.createCollection('contact_messages')
db.createCollection('contact_rate_limits')
db.contact_messages.createIndex({ status: 1, createdAt: 1 }, { name: 'contact_inbox' })
db.contact_rate_limits.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'contact_limit_expiry' })
```

Run collection creation once; on an existing database inspect existing collections instead of dropping them. Index creation is idempotent with these same definitions. The built-in unique `_id` index is essential for atomic limiter updates. The TTL index removes old limiter documents asynchronously; expiration correctness depends on window keys, **not** on TTL deletion timing. No automatic TTL deletes enquiries.

3. Create a dedicated application database user with only:
   - `insert` on `guidebook_contact.contact_messages`;
   - `find`, `insert`, `update` on `guidebook_contact.contact_rate_limits`.
   MongoDB custom role example (self-managed; run as a database user administrator):

```javascript
db.createRole({ role: 'contactSubmit', privileges: [
  { resource: { db: 'guidebook_contact', collection: 'contact_messages' }, actions: ['insert'] },
  { resource: { db: 'guidebook_contact', collection: 'contact_rate_limits' }, actions: ['find', 'insert', 'update'] }
], roles: [] })
db.createUser({ user: 'contact_app', pwd: passwordPrompt(), roles: [{ role: 'contactSubmit', db: 'guidebook_contact' }] })
```

   On Atlas create an equivalent custom database role/user in Database Access. Use that user's URI with the correct `authSource`. Operators need a separate role with `find`/`update` on the inbox, plus approved retention deletion rights. The application does not create indexes or require database-administration permissions.
4. Configure the server variables above. Enforce HTTPS publicly. At ingress set a request body cap of 18,000 bytes (or slightly higher if enforced before decoding), request/read timeout, and additional edge rate limiting for `/api/contact`. Reject compressed request bodies unless the ingress safely bounds decoded size. Avoid logging request bodies, email addresses, or the contact URI.
5. **Assign an inbox owner and review schedule before launch.** This implementation stores enquiries but sends no notification. Monitor contact 5xx/429 counts and age/count of unread inbox items; alert on sustained failures. Maintain backups and verify restore procedures.

### Trusted client address

Never set `CONTACT_TRUSTED_IP_HEADER=x-forwarded-for` merely because clients can send it. A single, proxy-overwritten address header is required. Block direct access to the application behind the ingress. For a single trusted nginx ingress, for example, overwrite `X-Contact-Client-IP` with nginx's authenticated `$remote_addr` and set `CONTACT_TRUSTED_IP_HEADER=x-contact-client-ip`. If another load balancer precedes nginx, configure nginx's trusted real-IP ranges first. Do not accept comma-separated forwarding chains.

Without a trusted header, or when its value is missing/invalid, all visitors share an `unknown` bucket: safe but deliberately restrictive. Raw IP addresses are not persisted. The limiter stores an HMAC-derived key and window counter, not enquiry content.

### Abuse controls and limits

- Same-origin `Origin` is mandatory and must match `CONTACT_ORIGIN`; `Sec-Fetch-Site: cross-site` is rejected. This is not authentication: automated clients can forge headers.
- JSON only, streaming byte cap 18,000, bounded string types/lengths, ten supported locale codes, required nonblank name/message, email syntax, control-character and header-injection rejection, bounded empty honeypot.
- Atomic MongoDB fixed-window counters: 5 valid attempts per trusted-address bucket per 15 minutes, then 100 address-admitted attempts globally per hour, shared across all workers/restarts. Address-blocked attempts never consume the global quota. Counters include attempts that later fail storage. Fixed windows allow boundary bursts; not a CAPTCHA or volumetric DDoS defense. Failed validation does not write to MongoDB; use edge protection for malformed-request floods.
- Rate-limit failure returns `429` with conservative `Retry-After: 900`. Global exhaustion can persist until the hourly window ends, so repeated 429s may need a longer wait. Backend errors fail closed as `503`, without disclosing database details.

## Staff inbox workflow

Using the separate operator connection, select the configured database and inspect new items:

```javascript
db.contact_messages.find({ status: 'new' }).sort({ createdAt: 1 }).limit(50)
// After handling one enquiry, use its actual ObjectId:
db.contact_messages.updateOne({ _id: ObjectId('REPLACE_WITH_ACTUAL_ID'), status: 'new' }, { $set: { status: 'handled', handledAt: new Date() } })
```

Treat all stored strings as untrusted plain text; never render them as HTML or concatenate them into mail headers. Fields are name, email, optional phone/subject, message, locale, server `createdAt`, and `status`. No credentials or IPs are stored with enquiries. Agree a retention/deletion policy with the business; delete resolved enquiries according to that policy, and cover backups in the policy. Do not add a public unauthenticated retrieval endpoint.

## Verification without production data

```sh
node --import tsx --test tests/contact.test.ts
# Entire repository suite:
node --import tsx --test tests/*.test.cjs tests/*.test.ts
```

Unit tests use synthetic `.invalid` addresses and injected database/fetch boundaries. The unconfigured-adapter test runs a subprocess with only `NODE_ENV=test`, never inherited credentials, and cannot connect to MongoDB. They do not load `.env` or submit real enquiries. Test coverage includes acknowledgement gating, validation/body/origin failures, limiter concurrency/window rollover/write concern, failure privacy, ten-language state copy, and client response handling.

Before production launch, an operator should run an **isolated staging** acceptance test against a staging replica set/database and staging host, with synthetic names/messages and `example.invalid` addresses. Verify the `201` maps to exactly one stored record, test unavailable-DB `503`, repeat to observe `429`, restart a worker to confirm limits persist, and verify keyboard/screen-reader pending/success/error announcements in the form. Remove staging test records afterward. Never run these acceptance requests against production or silently substitute production credentials. Real database replication/TTL provisioning and human inbox operations cannot be proved by the credential-free unit suite.
