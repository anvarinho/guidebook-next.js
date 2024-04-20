// import { Locale } from "@/lib/i18n.config";

import { Locale } from "@/lib/i18n.config";

interface Props {
  lang: Locale
  tour: TourInfo; // Assuming 'tour' is a string, adjust the type accordingly if it's different
  page: any
}

const Meta: React.FC<Props> = ({ lang,  tour, page }) => {
    const data = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": tour.title,
        "description": tour.description,
        "image": tour.images,
        "sku":tour._id,
        "brand": {
            "@type": "Brand",
            "name": "GuideBook of Kyrgyzstan"
        },
        "review": {
            "@type": "Review",
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": 4,
              "bestRating": 5
            },
            "author": {
              "@type": "Person",
              "name": "Fred Benson"
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": 4.8,
            "reviewCount": 12
        },
        "offers": {
            "@type": "Offer",
            "url": `${process.env.NEXT_PUBLIC_URL}/tours/${tour.url}`,
            "priceCurrency": "USD",
            "price": tour.price[0],
            "priceValidUntil": "2024-7-1",
            "availability": "https://schema.org/InStock"
          },
          "breadcrumb": {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": page.name,
                "item": `${process.env.NEXT_PUBLIC_URL}/${lang}`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": page.tours.name,
                "item": `${process.env.NEXT_PUBLIC_URL}/${lang}/tours`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": `${tour.title}`,
                "item": `${process.env.NEXT_PUBLIC_URL}/${lang}/tours/${tour.url}`
              }
            ]
          },
    }
    
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  };
  
  export default Meta;