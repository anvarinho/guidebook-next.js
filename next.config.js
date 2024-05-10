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
        source: "/contact",
        destination: "/en/contact", // Matched parameters can be used in the destination
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
        source: '/tour/summer-days', // Use the wildcard :slug* to match all deeper URLs
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
        source: '/tour/sightseeing-tour-of-bishkek', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/sightseeing-tour-of-bishkek', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/extended-tour-kyrgyzstan/', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/grand-tour-kyrgyzstan', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/tour/extended-tour-kyrgyzstan/', // Use the wildcard :slug* to match all deeper URLs
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
        source: '/tour/chunkurchak-valley-hiking', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/chunkurchak-valley-hiking', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/trekking-and-horse-riding-tour', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/tours/trekking-and-horse-riding-tour', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/tour/trekking-and-horse-riding-tour', // Use the wildcard :slug* to match all deeper URLs
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
        source: '/place/bishkek', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/bishkek-city', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/ysyk-kol', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/ysyk-kol-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/boom-gorge', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/boom-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kel-suu-lake', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kel-suu-lake/', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kochkor', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kochkor-village', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/bokonbay', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/bokonbay-village', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/batken', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/batken-town', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/osh', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/osh-city', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/naryn', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/naryn-town', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/alamedin', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/alamudun-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kyrchyn', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kyrchyn-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/philarmony', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/philharmonic-hall', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/panorama', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/panorama', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/panorama', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/panorama', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/erkindik-boulevard', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/erkindik-boulevard', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/yssyk-kol', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/ysyk-kol-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/toktogul-reservoir', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/toktogul-reservoir', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/shamshy-gorge', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/shamshy-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kegety-waterfall', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kegety-waterfall', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/naryn-river', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/naryn-river', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/karkyra-jayloo', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/karkyra-river', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/victory-peak', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/victory-peak', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/lenin-peak', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/lenin-peak', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/uzgen-minaret', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/ozgon-munara', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/chatkal-valley', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/chatkal-valley', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kegety-gorge', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kegeti-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/sokuluk-gorge', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/sokuluk-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/mayluu-suu', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/mailuu-suu-town', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/mars-canyons', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/mars-canyons', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/alamedin-waterfall', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/alamudun-waterfall', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/chu-river', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/chu-river', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kokomeren-river', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kokomeren-river', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/arslanbap-village', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/arslanbap-village', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/ala-kol', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/ala-kol-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/barskoon-gorge', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/barskoon-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kajy-say', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kajy-say-village', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/dungan-mosque', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/dungan-mosque', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/shaar-waterfall', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/shaar-waterfall', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kol-tor', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kol-tor-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/nansen-peak', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/nansen-peak', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/sarkent-gorge', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/sarkent-national-park', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kok-moinok', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kok-moinok-canyons', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/cholpon-ata', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/cholpon-ata-town', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/aygul-too', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/aigul-tash-mountain', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kol-kogur', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kol-kogur-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/osh-museum', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/osh-museum', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/karakol-gorge', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/karakol-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/shatyly-panorama', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/shatyly-panorama', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/belogorka-waterfall', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/tosh-bulak-waterfall', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/enilchek-glacier', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/enilchek-glacier', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/sary-moinok', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/sary-moinok-pass', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/tulpar-kol', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/tulpar-kol', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/grigoriev-gorge', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/chon-ak-suu-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/central-mosque', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/central-mosque', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/barskoon-waterfall', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/barskoon-waterfall', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/suusamyr-valley', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/suusamyr-valley', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/pyramidal-peak', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/pyramidal-peak', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/son-kol-waterfall', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/son-kol-waterfall', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kuturma-pass', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kuturma-pass', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/best-tash-lake', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/besh-tash-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/teskey-torpok-pass', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/teskey-torpok-pass', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/jalal-abad', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/jalal-abad-city', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/jalgyz-karagay-ashuu', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/jalgyz-karagay-ashuu', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/tuz-kol', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/tuz-kol-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/holy-trinity-cathedral', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/holy-trinity-cathedral', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/mausoleum-of-manas', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/manas-kumbozu-mausoleum', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/jyrgalan-ski-base', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/jyrgalan-village', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/hut-of-rucek', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/hut-of-rutsek', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/boruluu-lake', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/borulu-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/best-aral-national-reserve', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/besh-aral-state-reserve', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/ak-say-valley', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/ak-say-valley', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/ak-say-waterfall', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/ak-say-waterfall', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kok-kyia-valley', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kok-kyia-valley', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/mayluu-suu-museum', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/mayluu-suu-museum', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kara-suu-lake', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kara-suu-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/naryn-national-reserve', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/naryn-national-reserve', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/teshik-kol-lake', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/teshik-kol-lake', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/ak-say-canyons', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/ak-say-canyons', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/national-drama-theater', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kyrgyz-drama-theater', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/mayluu-suu-izolit', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/mayluu-suu-izolit', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/chon-kyzyl-suu-gorge', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/chon-kyzyl-suu-gorge', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kara-shoro-national-park', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kara-shoro-national-park', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/orto-tokoy-water-reservoir', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/orto-tokoy-water-reservoir', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/kyrgyz-ata-national-park', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/kyrgyz-ata-national-park', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/big-ala-archa-glacier', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/big-ala-archa-glacier', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
      {
        source: '/place/tomb-of-asaf-ibn-barkhiya', // Use the wildcard :slug* to match all deeper URLs
        destination: '/en/places/tomb-of-asaf-ibn-barkhiya', // Redirect to the equivalent URL in the /en/places path
        permanent: true,
      },
    ];
  },
  images: {
    domains: ["159.65.95.44","central-asia.live", "https://central-asia.live", "127.0.0.1"], // Add your external image domains here
    // unoptimized: true,
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
