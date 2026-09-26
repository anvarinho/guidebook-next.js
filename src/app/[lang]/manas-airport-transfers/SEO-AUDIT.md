# Manas Airport transfer search review

Reviewed 13 September 2026. Changes are in the local project; this review does not establish a live Google ranking or confirm deployment.

## Search findings

Queries sampled: `Manas airport transfers Bishkek compare prices`, `Manas airport Karakol transfer prices`, and searches restricted to `central-asia.live` and the comparison URL. This is a web-search sample, not a location-controlled Google rank report. No Search Console, keyword-volume or conversion data was available.

| Page found | Useful content | Opportunity for this page |
| --- | --- | --- |
| [Manas Taxi routes](https://manastaxi.kg/en/routes) | Route-specific starting fares in KGS and USD, with indicative journey times | Let readers see comparable routes and several companies in one place |
| [Advantour Bishkek transfer](https://www.advantour.com/kyrgyzstan/transfers/manas_airport-bishkek.htm) | Distinct vehicle prices and passenger/bag capacities | Explain that vehicle class and luggage capacity matter when comparing a fare |
| [Central Asia transfer service](https://central-asia.live/en/tours/manas-airport-transfers) | Existing service page found in search; published sedan and regional fares | Link the existing service page to the directory while keeping their booking and comparison purposes clear |

The new comparison URL was not confirmed in the search sample. Fetches of that URL, `/robots.txt` and `/sitemap.xml` returned errors in the research tool. This does **not** prove a 404, a Google crawl failure or exclusion from the index. Verify the deployed responses and Google-selected canonical in Search Console before drawing those conclusions.

## Implemented

- Refined all ten localized titles around Manas Airport, Bishkek and company comparison.
- Kept the route cards and company comparison; the extra at-a-glance table was removed at the owner’s request.
- Added direct answers to the cost-to-Bishkek and vehicle-choice questions in all languages. FAQ prices also use the directory data.
- Unified visible and structured FAQ answers in `content.ts` to avoid inconsistent translations or prices.
- Added localized directory links to every language's site footer and to the existing Manas Airport service page. Bishkek, Karakol and Cholpon-Ata destination articles also link to their transfer options, with return links to the destination guides.
- Added a practical pickup preparation guide, a late-night arrival FAQ and a publisher link to the About page. The guide gives planning advice without claiming a verified terminal meeting point or driver availability.
- Added city and vehicle filters directly above the company cards, synchronized with the booking form.
- Added a permanent redirect from the unlocalized directory URL to its English version.
- Retained clean self-canonicals, reciprocal language alternates, localized social metadata and sitemap entries. Unsupported transfer locales now call `notFound`.
- Set the transfer page's sitemap modification date to the actual content edit date rather than refreshing it on every sitemap generation. The provider research date remains separate.

These changes make information easier to read and discover. Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) emphasizes useful content and descriptive links; it does not promise a particular position. Its [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) calls for accurate modification dates.

FAQ markup remains synchronized for semantic accuracy. It is not a route to Google FAQ rich results: Google [retired that feature in May 2026](https://developers.google.com/search/updates). No ratings, review totals, live availability or guaranteed fares were added.

## Validation and launch follow-up

Local server-render checks cover all ten languages: one H1, seven companies, eight visible answers matching JSON-LD, unique IDs, localized canonicals and all eleven language/fallback alternates. Dictionary placeholders and localized footer links are checked too. The separate form logic check covers all twelve city/vehicle combinations and English enquiries. These checks do not replace testing a deployed Next.js page in a browser.

After deployment:

1. Check that the English and translated page URLs, robots file, sitemap and page assets return successful responses. The unlocalized directory URL should redirect once to English.
2. Inspect the canonical English URL and representative translated URLs in Search Console. Check rendered content, indexing eligibility and Google-selected canonical; request indexing and submit the sitemap. See Google's [Search Console guide](https://developers.google.com/search/docs/monitor-debug/search-console-start).
3. Record a baseline for queries about Manas/Bishkek airport transfers, Karakol transfers and Cholpon-Ata transfers. Compare impressions, clicks, CTR and average position by page, country and device after recrawling. Do not interpret a single manual search as a ranking measurement.
4. Check mobile performance with the deployed page. No Lighthouse or Core Web Vitals score was measured in this review.
5. Recheck provider fares and contact details before changing the displayed research date. Seek real customer feedback and original service photographs as they become available; add claims only with supporting evidence.

Publication, Google recrawling and subsequent ranking changes have not been verified by this local implementation.
