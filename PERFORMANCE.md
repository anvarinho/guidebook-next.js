Performance and SEO changes
===========================

October 2026 performance pass
-----------------------------

- Converted 44 referenced homepage PNGs to WebP ahead of deployment: 7,223,230
  bytes to 3,073,936 bytes (57.4% smaller). Hero and loader artwork went from
  818,715 to 404,388 bytes (50.6% smaller). Originals remain available for
  regeneration; the page, CSS, eagle SVG and preload logic use the WebP files.
  Dimensions and alpha channels are preserved exactly; color compression uses
  quality 80. Regenerate with `node scripts/optimize-intro.cjs`.
- Removed render-time remote-image downloads and blur generation from listing
  cards, article images and place/tour galleries. Next.js `placeholder="blur"`
  now uses precomputed inline WebP previews (at most 16 pixels per side).
- Consolidated place, tour and article API calls into `src/lib/contentApi.ts`.
  Public content uses 60-second revalidation, and legacy detail imports reuse
  the same function and fetch options. Next.js can deduplicate identical GETs
  within a render. Empty related-place lists make no request. Backend failures
  propagate instead of being mistaken for missing detail pages (only 404 is
  treated as missing).
- Dictionary imports are memoized per render; independent listing data and
  dictionary requests start together. Only the first featured destination gets
  image priority; below-the-fold tour-day galleries use lazy loading.
- Use WebP for on-demand image optimization to reduce cold-cache encoding CPU.
  Intro and transfer artwork gets the same one-day browser cache policy as
  Manas. Static file requests skip locale middleware.

Validation: production build, TypeScript, ESLint and eight API/weather regression
tests passed. Existing lint, CSS compatibility and Browserslist warnings remain.
All 44 generated assets were checked for source references, image dimensions and
exact alpha preservation. The compiled middleware matcher was checked against
page, API and image paths. These are asset measurements and code improvements;
production latency and Core Web Vitals have not been measured.

Manas artwork
-------------

| Measure | Bytes |
| --- | ---: |
| Original full-size assets | 6,523,263 |
| Compressed full-size assets | 1,526,530 |
| Added responsive 480px assets | 481,816 |
| Total optimized asset directory | 2,008,346 |

Full-size assets are 76.6% smaller. The entire directory is 69.2% smaller,
including responsive derivatives. Compression is lossy (WebP quality 28 (26 for mobile variants),
JPEG quality 38); transparent hero layers retain their dimensions and alpha.
Hero crop resolution is preserved. Portraits are capped at 640px wide, comics at
960px, origin artwork at 1024px, the reciter at 800px, and the social image at
1200px. Fine texture is softer with this more aggressive compression. Social
metadata reads the encoded image dimensions from the manifest. Comic and portrait dialogs use the full-size
source rather than a mobile thumbnail. Dimensions come from the asset manifest.

Regenerate from pristine sources using:

```sh
node scripts/optimize-manas.cjs /path/to/original/manas
```

The source directory must differ from `public/manas` to avoid repeated lossy
encoding. The script also removes obsolete derivatives it generated.

Shared improvements
-------------------

- Lazy loading for lower tour/article cards; only the first featured card has priority.
- Responsive sizes in shared image renderers; single-image rendering no longer
  waits for an additional full-image fetch and blur generation.
- Precomputed blur previews shared by cards, galleries and article images.
- WebP negotiation and one-day caching for Next.js optimized images.
- One-day caching with stale revalidation for Manas assets; response compression.
- Manas parallax stops off-screen, in hidden tabs, and when motion is paused.
- Only the 95 interactive Manas translation keys reach the client wrapper.
- Canonical/hreflang metadata and localized social metadata for home and Manas;
  shared URL fallback and language alternates for listing pages.
- Manas WebPage structured data, localized sitemap entries including Manas and
  contact, parallel sitemap fetches, and removal of invented modification dates.
- Login/admin noindex metadata; robots exclusions for private routes/API.

Image sizes and caching follow the [Next.js 14 image documentation](https://nextjs.org/docs/14/app/api-reference/components/image).

Lightweight blur previews
-------------------------

`getLocalBase64` now performs a synchronous lookup in a server-only manifest.
It never fetches or decodes a source image during page rendering. Only previews
for the rendered images are passed to client components, so the full manifest
and image-processing libraries stay out of client bundles. Next.js handles
removing the blur when each image loads. Gallery previews follow the selected
image. Pagination responses include image-specific previews. Images without a generated
preview use an empty placeholder rather than unrelated fallback artwork.

The homepage's opaque sky CSS background uses a tiny inline preview beneath the
full artwork. It requires no extra request or client decoding. Transparent
foreground layers retain their transparency.

After adding images, generate previews before building and deploying:

```sh
npm run images:placeholders
npm run build
```

The generator reads public place, tour and article content, bounds input size and
download time, and uses four bounded workers. Existing previews are reused.
Use `npm run images:placeholders -- --refresh` when images are replaced at the
same URL. Failures preserve existing entries; missing previews use an empty placeholder.
For local homepage artwork only, run `node scripts/generate-image-placeholders.cjs`.

These are measured asset-size reductions, not measured Core Web Vitals or
Lighthouse scores. Production performance should be assessed with real device
and network conditions after deployment.

Validation
----------

- Production `npm run build`: passed for the initial optimization pass.
- Stronger compression follow-up: TypeScript, targeted ESLint, script syntax,
  manifest/srcset dimensions, and hero transparency checks passed.
- TypeScript and ESLint: passed; existing warnings remain in HomePlaces and the
  privacy page, plus existing CSS compatibility/Browserslist build warnings.
- Generated canonical/hreflang tags checked across 60 localized pages.
- Manas JSON-LD, asset manifest references, actual image dimensions, and hero
  transparency checked; localized Manas/contact sitemap entries verified.
- Representative compressed comic artwork inspected visually.

October 2026 regression fixes
----------------------------

- Hosted Bai Jamjuree, Exo 2, Cormorant SC and Jura locally, preserving weights,
  language subsets and font fallback metrics. Compilation no longer downloads
  these fonts from Google. Font licenses are included in `public/fonts`.
- Fixed place-list response handling in the preview generator so place detail
  photos are included. Photo previews use 16-pixel WebP images from each source.
- Removed generic fallback artwork and added server-side preview lookup to
  paginated place responses. Page rendering still performs no image decoding.

Validation for these fixes: TypeScript and all 13 regression tests passed. ESLint
passed with existing warnings. English and Russian Manas pages returned HTTP
200 without compile-time font retries. All 374 previews (330 content photos and
44 local artwork assets) decoded successfully at no more than 16 pixels per
side. A paginated response returned all 12 cards with image-specific previews.

## 2026-10-30 detail-page performance verification

The 2026-10-30 changes preserve image quality, typography, and gallery/map dimensions. They were verified locally and subsequently deployed with the server caching pass below.

- The initial gallery image uses eager loading with high fetch priority. Browser tests check that priority is present in the initial server HTML.
- Thumbnail `sizes` matches the existing 72px mobile / 88px desktop CSS. The image-width allowlist includes matching 1x, 2x, and 3x variants; quality stays at 75.
- Latin and Russian body/heading font files are preloaded to avoid discovery only after CSS downloads. Other scripts keep their existing font behavior.
- Reveal effects use IntersectionObserver geometry. Reading progress caches article geometry and invalidates it when the article/body or viewport resizes.
- Google Maps mounts within 200px of the viewport. Its space remains reserved and the external Google Maps link remains available. Maps still downloads its own scripts when needed.
- Analytics queues initialization and interaction events, then downloads its library using Next.js `lazyOnload`. This preserves page views rather than requiring an interaction before tracking. Lighthouse may still report unused third-party JavaScript after it loads.
- The earlier flag change uses the unchanged PNG through a hashed CSS asset with one-year immutable caching.

### Measurements

The two reported thumbnails were fetched through the production image optimizer as WebP, quality 75. A 72px thumbnail on a 2x display previously selected 256px; it can now select 144px. The first thumbnail can reuse the already-downloaded hero instead of fetching another variant.

| Image | 256px bytes | 144px bytes |
| --- | ---: | ---: |
| botanical-garden.jpg | 12,566 | 4,158 |
| opera-and-balet.jpg | 9,374 | 3,560 |
| Total | 21,940 | 7,718 |

The measured reduction is 14,222 bytes (13.9 KiB), without reducing compression quality.

A controlled A/B rebuild used the same local production server, headless Chromium, 390×844 viewport, 2x display scale, five fresh contexts, and 40 animation-frame scroll steps per run. Fonts were ready before scrolling; third-party HTTPS was blocked in both versions. The CPU counter sums Chromium processes. Layout time comes from Chrome DevTools Performance counters.

| Median per scroll scenario | Before | After |
| --- | ---: | ---: |
| Chromium CPU | 1,320 ms | 1,360 ms |
| Main-thread task time | 352 ms | 356 ms |
| Layout time | 16 ms | 14 ms |

CPU is effectively unchanged in this small local sample; no CPU reduction is claimed. Earlier runs varied more, so these measurements do not predict field LCP/INP or Google Maps execution cost. The verified improvements are request priority/discovery, thumbnail bytes, and delaying third-party work until its intended loading phase.

`npm run lint`, `npm test` (70 tests), `npm run test:e2e` (10 browser tests), and `npm run build` passed. Browser fixtures use synthetic Maps/analytics IDs and intercepted third-party requests, and exercise deferred maps, analytics queues, thumbnails, image priority, font hints, reduced motion, and scrolling.

The flagged compatibility polyfills are supplied by Next.js. They have not been patched out of the runtime or removed by narrowing supported browsers. Stylesheets required to render the existing layout remain render-blocking. Re-run Lighthouse on the deployed build and use subsequent field data to assess real-user improvement.

## 2026-10-30 production server load reduction

Public place, tour, and article detail pages now generate on demand and cache their complete HTML/RSC output for 60 seconds. Previously only fetched data was cached, so React rendering, content validation, and Markdown sanitization repeated on every visit. Admin/auth/contact remain dynamic. The server-only content API uses the verified loopback endpoint on port 4001 instead of public HTTPS. The active working directory remains `/var/www/frontend`.

The Next.js RAM cache is bounded at 16 MiB, the single PM2 frontend uses a 256 MiB V8 old-space limit, and PM2 checks for a 512 MiB RSS restart threshold. The existing image cache was carried forward to avoid re-encoding all images after deployment. Appearance, image quality, localization, SEO, and the one-minute revalidation target are preserved.

Measurements used 30 sequential requests directly to `http://127.0.0.1:3000/en/places/bishkek-city`, after warming the route. CPU is the frontend process's Linux user/system CPU ticks converted using `CLK_TCK`; RSS is read from `/proc/PID/status`. These are small production samples, not a saturation load test.

| Measure | Before | Live warm cache after |
| --- | ---: | ---: |
| Frontend CPU for 30 requests | 2,350 ms | 390 ms |
| Median response time | 82 ms | 19 ms |
| 95th percentile response time | 240 ms | 49 ms |
| RSS after requests | 248 MiB | 143 MiB |
| Full-page cache hits | 0 / 30 | 30 / 30 |

Warm repeat-request CPU fell about 83%. Memory is an observed comparison across a process restart, not proof that caching alone caused the difference or that RSS cannot grow. An initial post-deployment batch overlapping background regeneration used 1,600 ms CPU, 41 ms median, and 432 ms p95, with 20 stale and 10 fresh cached responses; first generation and regeneration still cost CPU. The private candidate independently used 560 ms CPU with all 30 requests cached.

The server build and all 70 unit/regression tests passed. All 11 browser checks passed, including localized full-page cache hits, 404s, and uncached admin redirects. Public HTTPS smoke checks passed for home, places, English/Russian Bishkek, and Ala-Archa. No production enquiry or account was created.

## Remaining PageSpeed warnings: shared control styles

The language switcher, floating contact control, and loading state now import `controls.module.css` (4,088 bytes) instead of the entire legacy component stylesheet (14,159 bytes). The original stylesheet stays available to its legacy callers. The active rules, media queries, and keyframes were preserved; an unused Font Awesome import was removed. Analytics remains on `lazyOnload`, preserving non-interacting visits as requested. No compatibility polyfills were removed from Next.js.

A local three-run Chromium comparison used a 390×844 viewport, 2x scale, 150 ms simulated network latency, 1.6 Mbps download throughput, reduced motion, and blocked third-party HTTPS. It covered both cold and repeat visits. Median results:

| Measure | Before | After |
| --- | ---: | ---: |
| Cold CSS transfer | 18,202 bytes | 16,876 bytes |
| Cold CSS requests | 3 | 3 |
| Cold FCP | 776 ms | 780 ms |
| Cold LCP | 900 ms | 816 ms |
| Cold Chromium CPU | 880 ms | 930 ms |
| Repeat Chromium CPU | 870 ms | 820 ms |

The verified transfer reduction is 1,326 bytes. These small samples do not establish a CPU improvement or a field Web Vitals gain. The graph CSS chunking experiment increased CSS requests/bytes and was discarded; extra font preloads and a gallery stylesheet split were also discarded because they did not justify their request/priority tradeoffs. External stylesheets retain independent caching rather than being duplicated into every HTML response. The live nginx server already negotiates HTTP/2.

Google's library cannot be tree-shaken by this repository, and loading it only on interaction would lose some visits. The reported first-party chunk is Next.js/React bootstrap code, including guarded framework compatibility shims; its initial unused-code estimate is not a safe list of removable modules. Those warnings may remain. No PageSpeed score improvement is claimed.

The production build, lint, and 12 browser checks passed, including keyboard language selection and the contact control after scrolling. This follow-up is local and has not been deployed.
