import { Locale } from "@/lib/i18n.config";
import { absoluteSiteUrl, safeJsonLd } from "@/lib/seo";

interface Props {
  lang: Locale;
  places: PlaceAlias[];
  page: any;
}

export default function Meta({ lang, places, page }: Props) {
  const url = absoluteSiteUrl(`${lang}/places`);
  const listId = `${url}#places`;
  const breadcrumbId = `${url}#breadcrumb`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        url,
        name: page.sights.title,
        description: page.sights.description,
        inLanguage: page.langCode,
        breadcrumb: { "@id": breadcrumbId },
        mainEntity: { "@id": listId },
      },
      {
        "@type": "ItemList",
        "@id": listId,
        name: page.sights.title,
        numberOfItems: places.length,
        itemListOrder: "https://schema.org/ItemListOrderAscending",
        itemListElement: places.map((place, index) => {
          const placeUrl = absoluteSiteUrl(`${lang}/places/${place.url}`);
          return {
            "@type": "ListItem",
            position: index + 1,
            url: placeUrl,
            name: place.title,
            image: absoluteSiteUrl(place.images[0]),
            item: {
              "@type": "TouristAttraction",
              "@id": `${placeUrl}#place`,
              url: placeUrl,
              name: place.name,
              description: place.title,
              image: absoluteSiteUrl(place.images[0]),
              address: {
                "@type": "PostalAddress",
                addressLocality: place.region,
                addressCountry: "KG",
              },
              geo: place.location ? {
                "@type": "GeoCoordinates",
                latitude: Number(place.location.latitude),
                longitude: Number(place.location.longitude),
              } : undefined,
            },
          };
        }),
      },
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [{
          "@type": "ListItem",
          position: 1,
          name: page.sights.name,
          item: url,
        }],
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
