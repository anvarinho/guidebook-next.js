import { Locale } from "@/lib/i18n.config";

interface Props {
    place: Place; // Assuming 'tour' is a string, adjust the type accordingly if it's different
    lang: Locale
}

const Meta: React.FC<Props> = ({ lang, place }) => {
    // const data = {
    //     "@context": "https://schema.org",
    //     "@type": "Place",
    //     name: `${place.name}`,
    //     url: `${process.env.NEXT_PUBLIC_URL}/${lang}/places/${place.url}`,
    //     description: place.description.substring(0, 200),
    //     image: `${process.env.NEXT_PUBLIC_URL}/${place.images[0]}`,
    //     address: {
    //       "@type": "PostalAddress",
    //       "addressLocality": `${place.region}`,
    //       "addressCountry": "KG"
    //     },
    //     geo: {
    //       "@type": "GeoCoordinates",
    //       "latitude": place.location.latitude,
    //       "longitude": place.location.longitude
    //     },
    //     openingHours: "Mo-Su 06:00-22:00",
    //     sameAs: [
    //         `${process.env.NEXT_PUBLIC_URL}/en/places/${place.url}`,
    //         `${process.env.NEXT_PUBLIC_URL}/ru/places/${place.url}`
    //     ],
    //     additionalProperty: [
    //         {
    //           "@type": "PropertyValue",
    //           "name": "Category",
    //           "value": "Tourist Attraction"
    //         }
    //     ]
    // }
    const data = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: place.title,
        url: `${process.env.NEXT_PUBLIC_URL}/${lang}/places/${place.url}`,
        datePublished: place.created,
        dateModified: place.created,
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
        description: place.description.substring(0, 220),
        image: {
          "@type": "ImageObject",
          url: `${process.env.NEXT_PUBLIC_URL}/${place.images[0]}`,
          width: 800,
          height: 600
        },
        address: {
            "@type": "PostalAddress",
            "addressLocality": `${place.region}`,
            "addressCountry": "KG"
        },
        geo: {
            "@type": "GeoCoordinates",
            "latitude": place.location.latitude,
            "longitude": place.location.longitude
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${process.env.NEXT_PUBLIC_URL}/places/${place.url}`
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
    };
    
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  };
  
  export default Meta;