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
      }
    ];
  },
  images: {
    domains: ["159.65.95.44", "172.20.10.4", "127.0.0.1"], // Add your external image domains here
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
