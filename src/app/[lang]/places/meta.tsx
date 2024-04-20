
interface Props {
    places: [PlaceAlias]; // Assuming 'tour' is a string, adjust the type accordingly if it's different
}

import React from 'react';

const Meta: React.FC<Props> = ({ places }) => {
  const itemListElement = places.map((place, index) => {
    return {
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Place",
        "name": place.name,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": place.region,
          "addressCountry": "Kyrgyzstan"
        },
        "image":`${process.env.NEXT_PUBLIC_URL}/${place.images[0]}`,
        "telephone": `${process.env.NEXT_PUBLIC_PHONE_NUMBER}`,
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": place.location.latitude,
          "longitude": place.location.longitude
        }
      }
    };
  });

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": itemListElement
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default Meta;