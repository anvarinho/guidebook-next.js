# Editorial workspace and overview

Implemented locally; not deployed. No production reads, data writes, account
changes, indexes, or migrations were performed for this redesign. Authentication,
session expiry/revocation, login budgets and operator account tools are preserved.
No new packages or environment variables are required.

## Metrics and source records

The statistics reader was designed after inspecting the sibling Rust backend's
`src/statistics.rs`, `src/content.rs` and `src/db.rs`. It supports these persisted
schemas without assuming that every deployed backend is on the same version:

| Display | Calculation and scope |
| --- | --- |
| Collection cards | Current document counts for places, tours, articles and users. Not publication counts: the data has no verified publication-status field. |
| English checklist | Required nonblank English text plus a nonblank image path. Places: name/title/description. Tours: title/description. Articles: title and text in every paragraph, at least one paragraph. Not editorial approval or image URL availability. |
| Translation matrix | Same editorial text checks per locale, without the image requirement. Plain strings count only for English. No fallback English is counted as a translation. |
| Recorded API responses | Schema v2: sum the eight response counters in each valid route row. The responseClasses array must match the Rust schema. Legacy records: one response per valid integer statusCode, 100–599. Unknown versions/malformed counters are excluded, with a warning for matching dated windows. |
| Error rate | Recorded 4xx and 5xx responses divided by all recorded responses. Includes explicit 429/503/504 buckets. No denominator means no rate. |
| Response comparison | Percentage difference in recorded totals against an equal preceding period. Hidden for incomplete current UTC days, zero baseline, insufficient retained history or unsupported records. Earliest retained timestamp is only an availability check, not proof that no windows are missing. |
| Daily chart and route ranking | Stored response counts, not the number of window documents. Windows belong to their completion timestamp's UTC date. Only known backend route templates are returned; unknown paths become “Other API routes.” |
| Stored view leaders | Existing cumulative nonnegative integer viewCount counters, independent of date filters. Not unique visitors or business conversions. |
| Recently updated | Existing BSON Date updatedAt values, newest first; no inferred edits from creation dates/ObjectIds. No editor names or audit events are invented. |
| Team access | Boolean isActive/isAdmin flags. “Active administrators” requires both flags true. |

The backend does not provide reliable visitor/session analytics, bot identifiers,
revenue, conversion rates, or historical publication counts. Bots and internal
requests remain included. Next.js/CDN cache hits do not necessarily reach the
backend. Counter retention, outages, retries and incomplete windows can affect
comparisons; the UI explains these limits.

## Dates and correctness

Reporting uses UTC throughout. From/through dates are inclusive calendar dates;
the database uses [from 00:00 UTC, day-after-through 00:00 UTC). A period can span
1–31 days, with no future dates. The default is the last seven complete UTC days.
Invalid dates (including nonexistent leap days), arrays, inverted ranges and
oversized ranges fall back with a visible explanation. BSON Date timestamps are
required for date-range reporting: missing/invalid/string timestamps cannot be
assigned to a reporting period. Gaps are shown as zero *recorded* responses, not
proof of zero traffic. An empty denominator never produces a made-up percentage.

Open “Explore daily values” for the accessible table equivalent of the SVG chart.
Dates, route links, readiness counts and translation cells drill down into real
filtered lists. Report state filters select windows containing the chosen class;
rows retain all counts for matching known route templates within each window.
Unsupported stored records remain visible when browsing an unfiltered period.

## Functional changes

Search, state/language filters, allowlisted sorting and 20-record pagination run
on the server and persist in URL parameters. Pagination keeps all active filters.
Content sorts support newest/oldest, name, stored views and updatedAt; reports
sort by timestamp, users by ID/name. Every sort has a deterministic ID tie-breaker.

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
records. No passwords, session handles, IPs, raw unknown routes or user agents
are sent to overview/report components.

Content checks inspect at most 10,001 records per collection. Above 10,000, exact
counts use the ID index while partial coverage/rankings/update samples are hidden.
Response queries match the indexed date range first and inspect at most 100,001
windows across current/prior periods. Exceeding 100,000 windows or a query failure
shows “unavailable,” never partial totals presented as complete results. Large
content/checklist queries should be redesigned around reviewed materialized
metadata before increasing these budgets.

## Index review — do not apply automatically

No production index changes are required or applied by this implementation.
Review query plans and write overhead on staging before considering:

- statistics `{timestamp:-1}`: already managed by the Rust backend, including its
  TTL. Preserve its existing retention settings; do not replace it blindly.
- statistics `{route:1,timestamp:-1}` for legacy route filters and
  `{'routes.route':1,timestamp:-1}` for v2 route filters (multikey).
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
`test-results/` (ignored by Git). See PERFORMANCE.md for workload measurements.
