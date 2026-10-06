<div align="center">

<img src="public/manas/hero-background.webp" alt="Illustrated Kyrgyz mountain landscape beneath a red sun" width="100%" />

# Guidebook of Kyrgyzstan

**Mountain trails. Nomadic culture. Your next adventure.**

A multilingual travel guide to Kyrgyzstan — explore places, discover tours,<br />
read local stories, and plan your journey from Manas Airport.

![Next.js 14](https://img.shields.io/badge/Next.js-14-171717?style=flat-square&logo=nextdotjs&logoColor=white)
![React 18](https://img.shields.io/badge/React-18-149ECA?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Languages](https://img.shields.io/badge/Languages-10-1B3E32?style=flat-square)

[Explore](#explore) · [Quick start](#quick-start) · [Configuration](#configuration) · [Project map](#project-map) · [Deployment](#deployment)

</div>

---

## Explore

| | Experience |
| :--- | :--- |
| 🏔️ **Places** | Discover destinations with galleries, descriptions, and weather information. |
| 🧭 **Tours** | Browse trips and explore their itineraries and photo galleries. |
| 📖 **Stories** | Read articles about Kyrgyzstan and its destinations. |
| 🦅 **Culture** | Explore the epic of Manas through an illustrated, interactive experience. |
| 🚐 **Airport transfers** | Compare transfer options and plan onward travel from Manas Airport. |
| 🎨 **Immersive home page** | Explore layered artwork and parallax scenes inspired by Kyrgyz landscapes and culture. |
| 🌍 **Ten languages** | Access localized pages, navigation, and travel content. |
| ⚙️ **Administration** | Manage content and users through the MongoDB-backed admin area. |

Built with **Next.js App Router**, **React**, and **TypeScript**, with CSS Modules for styling, optimized imagery, and localized SEO metadata.

## Quick start

You’ll need **Node.js 18.17 or newer** and **npm**. Content-driven pages also require access to the project’s content API.

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure your environment

Create `.env.local` in the project root:

```dotenv
NEXT_PUBLIC_URL=http://localhost:3000
```

> **Content API:** Places, tours, and articles fetch data from `/api/places`, `/api/tours`, and `/api/articles` at `NEXT_PUBLIC_URL`. Those API handlers are not included in this repository. For these pages, replace the local URL with an origin that serves the content API. You can develop the home page, static assets, and airport transfer directory without it.

### 3. Start exploring

```bash
npm run dev
```

Open **[localhost:3000](http://localhost:3000)**. The root route redirects to the English home page at `/en`.

## Configuration

Set environment-specific values in `.env.local`:

| Variable | Purpose |
| :--- | :--- |
| `NEXT_PUBLIC_URL` | Site/API origin used by content fetchers and canonical metadata |
| `NEXT_PUBLIC_PHONE_NUMBER` | Contact and WhatsApp number |
| `NEXT_PUBLIC_EMAIL` | Contact email |
| `GOOGLE_ANALYTICS_ID` | Google Analytics measurement ID |
| `GOOGLE_MAPS_API_KEY` | Google Maps content on place pages |
| `DB_HOST` | MongoDB host for the admin area |
| `DB_PORT` | MongoDB port for the admin area |
| `DB_NAME` | MongoDB database name for the admin area |

Keep secrets out of version control. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser and must not contain secrets.

## Development commands

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run Next.js ESLint checks |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run images:placeholders` | Generate image blur placeholders, including remote content images |

## Routes & languages

Public pages live under `src/app/[lang]`. Replace `{lang}` with a supported locale code.

| Route | Destination |
| :--- | :--- |
| `/{lang}` | Home and illustrated introduction |
| `/{lang}/places` | Places directory |
| `/{lang}/places/{placeUrl}` | Place details |
| `/{lang}/tours` | Tours directory |
| `/{lang}/tours/{tourUrl}` | Tour details and itinerary |
| `/{lang}/articles` | Articles directory |
| `/{lang}/articles/{articleUrl}` | Article details |
| `/{lang}/manas` | Illustrated Manas experience |
| `/{lang}/manas-airport-transfers` | Airport transfer guide |
| `/{lang}/about` · `/{lang}/contact` | About and contact pages |
| `/admin` | Content administration |

**Supported languages**

English `en` · Russian `ru` · French `fr` · German `de` · Spanish `es` · Italian `it` · Japanese `jp` · Korean `kr` · Arabic `ae` · Chinese `cn`

Main translation dictionaries live in [`src/dictionaries`](src/dictionaries). The [intro](src/app/intro/translations), [Manas experience](src/app/%5Blang%5D/manas/translations), and [airport transfer guide](src/app/%5Blang%5D/manas-airport-transfers/translations) have their own translations alongside their page content.

## Project map

```text
src/
├── app/
│   ├── [lang]/                 Localized pages and shared site components
│   │   ├── places/             Destination directory and details
│   │   ├── tours/              Tours, galleries, and itineraries
│   │   ├── articles/           Travel articles
│   │   ├── manas/              Illustrated cultural experience
│   │   └── manas-airport-transfers/
│   │                           Transfer directory and journey guide
│   ├── admin/                  Admin pages, data access, and MongoDB models
│   └── intro/                  Home page scenes and parallax presentation
├── dictionaries/               Main site translations
└── lib/                        Content fetching, locales, imagery, and SEO
public/                         Images, icons, fonts, and static assets
scripts/                        Image optimization and placeholder generation
```

The home page uses the intro experience in `src/app/intro`, with scene artwork and animation behavior defined separately from content styling. Public place, tour, and article content comes from the configured API; the admin area connects to MongoDB.

## Deployment

Configure the production environment, then build and serve the app on a Node.js-compatible host:

```bash
npm run build
npm start
```

- Set `NEXT_PUBLIC_URL` to the deployed canonical site/API origin before building.
- Ensure the content API is reachable from the server during rendering.
- Configure `DB_HOST`, `DB_PORT`, and `DB_NAME` when using the admin area.
- Add contact, analytics, and map settings as needed.

Development output lives in `.next`; production output lives in `.next-build`, so building does not overwrite chunks used by a running development server.

---

<div align="center">

**Discover Kyrgyzstan, one journey at a time.**

[Back to top ↑](#guidebook-of-kyrgyzstan)

</div>
