import { Locale } from "@/lib/i18n.config";
import { absoluteSiteUrl, metaDescription, safeJsonLd } from "@/lib/seo";

interface Props {
  lang: Locale;
  tour: TourInfo;
  page: any;
}

export default function Meta({ lang, tour, page }: Props) {
  const url = absoluteSiteUrl(`${lang}/tours/${encodeURIComponent(tour.url)}`);
  const tourPage = page.tours.tourPage;
  const duration = `${tour.days.length} ${tour.days.length === 1 ? tourPage.day : tourPage.days}`;
  const prices = tour.price.map(Number).filter(price => Number.isFinite(price) && price > 0);
  const description = metaDescription(
    tour.description,
    duration,
    prices.length ? `${tourPage.from} $${Math.min(...prices)}` : "",
  );
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristTrip",
        "@id": `${url}#trip`,
        url,
        name: tour.title,
        description,
        image: tour.images.slice(0, 6).map(image => absoluteSiteUrl(image)),
        inLanguage: page.langCode,
        ...(tour.days.length ? { duration: `P${tour.days.length}D` } : {}),
        itinerary: {
          "@type": "ItemList",
          numberOfItems: tour.days.length,
          itemListElement: tour.days.map((day, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${tourPage.day} ${index + 1}`,
            description: day.activities.join("; "),
          })),
        },
        ...(prices.length ? {
          offers: {
            "@type": "AggregateOffer",
            url,
            priceCurrency: "USD",
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
          },
        } : {}),
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: tour.title,
        description,
        inLanguage: page.langCode,
        mainEntity: { "@id": `${url}#trip` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: page.tours.name, item: absoluteSiteUrl(`${lang}/tours`) },
          { "@type": "ListItem", position: 2, name: tour.title, item: url },
        ],
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
