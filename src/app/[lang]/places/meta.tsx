import { Locale } from "@/lib/i18n.config";

interface Props {
  lang: Locale;
  places: PlaceAlias[];
  page: any;
}

const origin = (process.env.NEXT_PUBLIC_URL || "").replace(/\/$/, "");
const absoluteUrl = (path: string) => origin ? `${origin}${path}` : path;

export default function Meta({ lang, places, page }: Props) {
  const url = absoluteUrl(`/${lang}/places/`);
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
          const placeUrl = absoluteUrl(`/${lang}/places/${place.url}`);
          return {
            "@type": "ListItem",
            position: index + 1,
            url: placeUrl,
            name: place.title,
            image: absoluteUrl(`/${place.images[0]}`),
            item: {
              "@type": "TouristAttraction",
              "@id": `${placeUrl}#place`,
              url: placeUrl,
              name: place.name,
              description: place.title,
              image: absoluteUrl(`/${place.images[0]}`),
              address: {
                "@type": "PostalAddress",
                addressLocality: place.region,
                addressCountry: "KG",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: Number(place.location.latitude),
                longitude: Number(place.location.longitude),
              },
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

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
