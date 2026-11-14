/** @type {import('next').NextConfig} */
const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");
const legacyRedirects = require("./legacy-redirects.json");

const contentSecurityPolicy = [
  "default-src 'self'",
  // Next inlines its bootstrap scripts in prerendered pages.
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-src https://www.google.com https://www.youtube.com https://www.youtube-nocookie.com",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
].join('; ');

const nextConfig = {
  turbopack: {
    resolveAlias: {
      // Next's polyfill-module ships Array.at/flat, Object.hasOwn, etc. that every supported browser already has.
      '../build/polyfills/polyfill-module': './src/lib/polyfill-module-lite.js',
    },
  },
  // Keep hot public pages in RAM without consuming the default 50 MiB cache.
  cacheMaxMemorySize: 16 * 1024 * 1024,
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Keep prerendering, inline artwork, maps, and analytics working.
          { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; frame-ancestors 'self'" },
          // Report-only until browser consoles show no violations; then promote it to the policy above.
          ...(process.env.NODE_ENV === 'production' ? [
            { key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy },
            { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          ] : []),
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=()' },
        ],
      },
      ...['/admin/:path*', '/login', '/api/auth/:path*'].map(source => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
      // Static artwork folders in public/. Localized HTML keeps Next's own caching so
      // browsers never hold pages that reference chunks removed by a later deploy.
      ...["/manas/:path*", "/intro/:path*", "/manas-airport-transfers/:path*"].map(source => ({
        source,
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      })),
    ];
  },
  async redirects() {
    return [
      // Exact legacy URLs (old /place and /tour slugs, root sections). Renames only;
      // unchanged place slugs are covered by the /place/:slug rule below.
      ...Object.entries(legacyRedirects).map(([source, destination]) => ({ source, destination, permanent: true })),
      // Order matters: the explicit /places/en/... entries above win over /places/:slug*.
      ...[
        ["/places/en/tours/:path*", "/en/tours/:path*"],
        ["/:lang/places/en/tours", "/:lang/tours"],
        ["/:lang/places/en/tours/:path*", "/:lang/tours/:path*"],
        ["/places/:slug*", "/en/places/:slug*"],
        ["/articles/:slug*", "/en/articles/:slug*"],
        ["/tours/:slug*", "/en/tours/:slug*"],
        ["/place/:slug", "/en/places/:slug"],
      ].map(([source, destination]) => ({ source, destination, permanent: true })),
    ];
  },
  images: {
    maximumDiskCacheSize: 256 * 1024 * 1024,
    // WebP costs less CPU to encode on a cold image cache than AVIF.
    formats: ["image/webp"],
    // /uploads files are replaced by new names, not edited in place; keep optimized copies a week.
    minimumCacheTTL: 604800,
    deviceSizes: [384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Keep thumbnail widths and a compact 384px source available to content images.
    imageSizes: [32, 48, 64, 72, 88, 96, 128, 144, 176, 216, 256, 264, 384],
    remotePatterns: [
      { protocol: "https", hostname: "central-asia.live", pathname: "/uploads/**" },
    ],
  },
  experimental: {
    // Prerendering every locale must fit the content API's request limit.
    cpus: 2,
    // Only ~22 KiB of CSS per page: inline it so it stops blocking first render.
    inlineCss: true,
    staticGenerationMaxConcurrency: 1,
  },
};


// Export the combined config
// Keep production builds from overwriting chunks used by a running dev server.
module.exports = (phase) => ({
  ...nextConfig,
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next' : (process.env.NEXT_DIST_DIR || '.next-build'),
});
