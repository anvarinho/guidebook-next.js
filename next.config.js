/** @type {import('next').NextConfig} */
const nextConfig = {
  // i18n:{
  //     locales:['en-US', 'fr'],
  //     defaultLocale: 'en-US',
  //     localeDetection: true
  // },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/en", // Matched parameters can be used in the destination
        permanent: true,
      },
      {
        source: "/places",
        destination: "/en/places", // Matched parameters can be used in the destination
        permanent: true,
      },
      {
        source: '/places/:slug*', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/:slug*', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: "/articles",
        destination: "/en/articles", // Matched parameters can be used in the destination
        permanent: true,
      },
      {
        source: '/articles/:slug*', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/articles/:slug*', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: "/about",
        destination: "/en/about", // Matched parameters can be used in the destination
        permanent: true,
      },
      {
        source: "/tours",
        destination: "/en/tours", // Matched parameters can be used in the destination
        permanent: true,
      },
      {
        source: '/tours/:slug*', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/:slug*', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/karakol-ski-base', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/karakol-ski-base', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/karakol', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/karakol-city', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kichi-alay-valley', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kichi-alay-valley', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/the-welcome-tour', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/chuy-region-highlights-tour', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/summer-days', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/chuy-ysyk-kol-highlights-tour', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/extended-tour-north-of-kyrgyzstan', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/grand-tour-south-kyrgyzstan', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/sightseeing-tour-of-bishkek', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/sightseeing-tour-of-bishkek', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/extended-tour-kyrgyzstan/', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/grand-tour-kyrgyzstan', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/26', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kichi-alay-valley', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/tour/6', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/trekking-and-horse-riding-tour', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/chunkurchak-valley-hiking', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/chunkurchak-valley-hiking', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/trekking-and-horse-riding-tour', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/trekking-and-horse-riding-tour', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/magic-of-summer', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/kyrgyzstan-highlights-tour', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/jashyl-kol', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/jashyl-kol', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/tour/extended-tour-north-of-kyrgyzstan/', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/grand-tour-south-kyrgyzstan', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/sary-chelek', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/sary-chelek-biosphere-reserve', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/Bishkek', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/bishkek-city', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      }
    ];
  },
  images: {
    domains: ["159.65.95.44","central-asia.live", "https://central-asia.live", "127.0.0.1"], // Add your external image domains here
    unoptimized: true,
  },
  webpack(config) {
    config.infrastructureLogging = { debug: /PackFileCache/ };
    return config;
  }
  // experimental: {
  //   serverActions: true,
  // }
};


// Export the combined config
module.exports = nextConfig;
