import { Locale } from "@/lib/i18n.config";

interface Props {
    place: Place; // Assuming 'tour' is a string, adjust the type accordingly if it's different
    lang: Locale
    page: any
}

const Meta: React.FC<Props> = ({ lang, place, page }) => {
  
    const data = {
      "@context": "https://schema.org",
      "@type": "Place",
      "name": place.name,
      "title": place.title,
      "description": place.description.substring(0, 220),
      "address": {
        "@type": "PostalAddress",
        "addressLocality": place.region,
        "addressCountry": "Kyrgyzstan"
      },
      author: {
        "@type": "Person",
        name: "Anvar Jumabaev"
      },
      publisher: {
        "@type": "Organization",
        name: "GuideBook of Kyrgyzstan",
        logo: {
          "@type": "ImageObject",
          url: `${process.env.NEXT_PUBLIC_URL}/favicon.ico`
        }
      },
		"image":`${process.env.NEXT_PUBLIC_URL}/${place.images[0]}`,
      "telephone": `${process.env.NEXT_PUBLIC_PHONE_NUMBER}`,
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": place.location.latitude,
        "longitude": place.location.longitude
      },
      "hasMap": `${process.env.NEXT_PUBLIC_URL}/${lang}/places/${place.url}`,
      "breadcrumb": {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": page.sights.name,
            "item": `${process.env.NEXT_PUBLIC_URL}/${lang}/places`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": `${place.name}`,
            "item": `${process.env.NEXT_PUBLIC_URL}/${lang}/places/${place.url}`
          }
        ]
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday"
        ],
        "opens": "09:00",
        "closes": "18:00"
      },
      sameAs: [
          `${process.env.NEXT_PUBLIC_URL}/en/places/${place.url}`,
          `${process.env.NEXT_PUBLIC_URL}/ru/places/${place.url}`
      ],
      additionalProperty: [
          {
            "@type": "PropertyValue",
            "name": "Category",
            "value": "Tourist Attraction"
          }
      ]
    }
    
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  };
  
  export default Meta;