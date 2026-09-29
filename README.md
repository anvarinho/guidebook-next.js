# Guidebook of Kyrgyzstan

A multilingual travel guide for discovering places, tours, articles, and airport transfers in Kyrgyzstan. The site is built with Next.js App Router, React, and TypeScript.

## Requirements

- Node.js 18 or newer
- npm
- Access to the content API for places, tours, and articles

## Getting started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to the English home page at `/en`.

Create a local `.env.local` file for environment-specific settings. At minimum, set the public site/API origin used by the server-side content fetchers:

```dotenv
NEXT_PUBLIC_URL=http://localhost:3000
```

The places, tours, and articles pages request data from `/api/places`, `/api/tours`, and `/api/articles` on this origin. Those API route handlers are not included in this repository, so point `NEXT_PUBLIC_URL` at an origin that serves the content API. The home page, static assets, and airport transfer directory can be developed without that content API.

Optional settings used by the site:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_PHONE_NUMBER` | Contact and WhatsApp number |
| `NEXT_PUBLIC_EMAIL` | Contact email |
| `GOOGLE_ANALYTICS_ID` | Google Analytics measurement ID |
| `GOOGLE_MAPS_API_KEY` | Google Maps content on place pages |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | MongoDB connection for the admin area |

Keep secrets in `.env.local` and out of version control. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and should not contain secrets.

## Useful commands

```bash
npm run dev      # Start the local development server
npm run lint     # Run Next.js ESLint checks
npm run build    # Create a production build
npm start        # Serve the production build
```

Run `npm run build` before deploying. Then use `npm start` to serve the generated build.

## Main routes

Pages are localized under `src/app/[lang]`:

- `/{lang}` — home
- `/{lang}/places` — places directory and place details
- `/{lang}/tours` — tours directory and tour details
- `/{lang}/articles` — articles directory and article details
- `/{lang}/manas-airport-transfers` — Manas Airport transfer guide
- `/{lang}/about` and `/{lang}/contact` — about and contact pages
- `/admin` — content administration area

Supported locale codes are `en`, `ru`, `fr`, `de`, `es`, `it`, `jp`, `kr`, `ae`, and `cn`. Translation dictionaries live in `src/dictionaries`; the airport transfer page has its own dictionaries alongside that page.

## Project layout

```text
src/app/[lang]/       Localized pages and shared site components
src/app/admin/        Admin pages and MongoDB models
src/app/intro/        Home page content and parallax presentation
src/dictionaries/     Main site translations
src/lib/              Locale, content-fetching, and SEO helpers
public/               Images, icons, and other static assets
```

The home page uses the intro experience in `src/app/intro`. Its scene artwork and parallax behavior are defined separately from the content styling. Place and tour details are loaded from the configured content API.

## Content and deployment notes

The admin area connects to MongoDB using `DB_HOST`, `DB_PORT`, and `DB_NAME`. The public place, tour, and article pages use the content API configured by `NEXT_PUBLIC_URL`; make sure that API is reachable from the server during rendering. Set `NEXT_PUBLIC_URL` to the deployed canonical site/API origin in production, and provide analytics, map, and contact settings only when those integrations are needed.

Deploy the Next.js app to a Node.js-compatible host. Build the app with `npm run build`, then run `npm start` with the production environment variables configured.
