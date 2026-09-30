Performance and SEO changes
===========================

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
- Persistent caching of generated blur placeholders for other renderers.
- AVIF/WebP negotiation and one-day caching for Next.js optimized images.
- One-day caching with stale revalidation for Manas assets; response compression.
- Manas parallax stops off-screen, in hidden tabs, and when motion is paused.
- Only the 95 interactive Manas translation keys reach the client wrapper.
- Canonical/hreflang metadata and localized social metadata for home and Manas;
  shared URL fallback and language alternates for listing pages.
- Manas WebPage structured data, localized sitemap entries including Manas and
  contact, parallel sitemap fetches, and removal of invented modification dates.
- Login/admin noindex metadata; robots exclusions for private routes/API.

Image sizes and caching follow the [Next.js 14 image documentation](https://nextjs.org/docs/14/app/api-reference/components/image).

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
