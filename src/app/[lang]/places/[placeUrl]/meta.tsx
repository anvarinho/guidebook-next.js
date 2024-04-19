import { Locale } from "@/lib/i18n.config";

interface Props {
    place: Place; // Assuming 'tour' is a string, adjust the type accordingly if it's different
    lang: Locale
}

const Meta: React.FC<Props> = ({ lang, place }) => {
    const data = {
        "@context": "https://schema.org",
        "@type": "Place",
        name: `${place.name}`,
        url: `${process.env.NEXT_PUBLIC_URL}/${lang}/places/${place.url}`,
        description: place.description.substring(0, 200),
        image: `${process.env.NEXT_PUBLIC_URL}/${place.images[0]}`,
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
        openingHours: "Mo-Su 06:00-22:00",
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