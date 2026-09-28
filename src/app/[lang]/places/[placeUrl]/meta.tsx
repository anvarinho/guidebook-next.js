import { Locale } from "@/lib/i18n.config";

interface Props {
  place: Place;
  lang: Locale;
  page: any;
}

const origin = (process.env.NEXT_PUBLIC_URL || "").replace(/\/$/, "");
const absoluteUrl = (path: string) => origin ? `${origin}${path}` : path;

export default function Meta({ lang, place, page }: Props) {
  const url = absoluteUrl(`/${lang}/places/${place.url}/`);
  const breadcrumbUrl = absoluteUrl(`/${lang}/places/`);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristAttraction",
        "@id": `${url}#place`,
        url,
        name: place.name,
        description: place.description.substring(0, 500),
        image: place.images.map(image => absoluteUrl(`/${image}`)),
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
        hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.location.latitude},${place.location.longitude}`)}`,
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: place.title,
        description: place.description.substring(0, 500),
        inLanguage: page.langCode,
        mainEntity: { "@id": `${url}#place` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: page.sights.name, item: breadcrumbUrl },
          { "@type": "ListItem", position: 2, name: place.name, item: url },
        ],
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
