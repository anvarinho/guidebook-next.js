import { Locale } from '@/lib/i18n.config';

export default function Meta({ lang, page }: { lang: Locale; page: any }) {
  const siteUrl = (process.env.NEXT_PUBLIC_URL || 'https://central-asia.live').replace(/\/$/, '');
  const pageUrl = `${siteUrl}/${lang}/about/`;
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TravelAgency',
        '@id': `${siteUrl}/#organization`,
        name: 'GuideBook of Kyrgyzstan',
        url: siteUrl,
        logo: `${siteUrl}/favicon.ico`,
        image: [`${siteUrl}/bozuy.jpg`, `${siteUrl}/bozteri.jpg`],
        telephone: process.env.NEXT_PUBLIC_PHONE_NUMBER,
        priceRange: '$$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Razzakov, 49',
          addressLocality: 'Bishkek',
          addressRegion: 'Chuy Region',
          postalCode: '720028',
          addressCountry: 'KG',
        },
        geo: { '@type': 'GeoCoordinates', latitude: 42.8746, longitude: 74.5698 },
        areaServed: { '@type': 'Country', name: 'Kyrgyzstan' },
        sameAs: [
          'https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810',
          'https://play.google.com/store/apps/details?id=com.anvarinho.guidebook',
        ],
      },
      {
        '@type': 'AboutPage',
        '@id': pageUrl,
        url: pageUrl,
        name: page.about.title,
        description: page.about.description,
        inLanguage: page.langCode,
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#organization` },
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'GuideBook of Kyrgyzstan',
        inLanguage: page.langCode,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'GuideBook of Kyrgyzstan', item: `${siteUrl}/${lang}/` },
          { '@type': 'ListItem', position: 2, name: page.about.title, item: pageUrl },
        ],
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
