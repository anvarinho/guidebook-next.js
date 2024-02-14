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
            source: '/',
            destination: '/en', // Matched parameters can be used in the destination
            permanent: true,
          },
          {
              source: '/places',
              destination: '/en/places', // Matched parameters can be used in the destination
              permanent: true,
          },
          {
              source: '/contact',
              destination: '/en/contact', // Matched parameters can be used in the destination
              permanent: true,
          },
          {
              source: '/about',
              destination: '/en/about', // Matched parameters can be used in the destination
              permanent: true,
          },
          {
              source: '/tours',
              destination: '/en/tours', // Matched parameters can be used in the destination
              permanent: true,
          },
        ]
      },
    images: {
        domains: ['172.20.10.4', '127.0.0.1'], // Add your external image domains here
        // unoptimized: true,
    },
    webpack(config) {
        config.infrastructureLogging = { debug: /PackFileCache/ }
        return config;
    },
    
}


  module.exports = nextConfig
