import { Locale } from "@/lib/i18n.config";
import { absoluteSiteUrl, metaDescription, safeJsonLd } from "@/lib/seo";

interface Props {
  place: Place;
  lang: Locale;
  page: any;
}

export default function Meta({ lang, place, page }: Props) {
  const url = absoluteSiteUrl(`${lang}/places/${encodeURIComponent(place.url)}`);
  const breadcrumbUrl = absoluteSiteUrl(`${lang}/places`);
  const latitude = Number(place.location?.latitude);
  const longitude = Number(place.location?.longitude);
  const coordinatesAreValid = Number.isFinite(latitude) && Number.isFinite(longitude);
  const description = metaDescription(place.description);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristAttraction",
        "@id": `${url}#attraction`,
        url,
        name: place.name,
        description,
        image: place.images.slice(0, 6).map(image => absoluteSiteUrl(image)),
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: place.region,
          containedInPlace: { "@type": "Country", name: "Kyrgyzstan" },
        },
        address: {
          "@type": "PostalAddress",
          addressLocality: place.region,
          addressCountry: "KG",
        },
        ...(coordinatesAreValid ? { geo: {
          "@type": "GeoCoordinates",
          latitude,
          longitude,
        } } : {}),
        ...(coordinatesAreValid ? { hasMap: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` } : {}),
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: place.title,
        description,
        inLanguage: page.langCode,
        mainEntity: { "@id": `${url}#attraction` },
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

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
