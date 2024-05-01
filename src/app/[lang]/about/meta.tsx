const Meta = () => {
    const data = {
        "@context": "https://schema.org",
        "@type": "TravelAgency",
        "image": [
            `${process.env.NEXT_PUBLIC_URL}/bozuy.jpg`,
            `${process.env.NEXT_PUBLIC_URL}/bozteri.jpg`,
        ],
        "name": "GuideBook of Kyrgyzstan",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Razzakov, 49",
          "addressLocality": "Bishkek",
          "addressRegion": "KG",
          "postalCode": "720028",
          "addressCountry": "KG"
        },
        "review": {
          "@type": "Review",
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": "5",
            "bestRating": "5"
          },
          "author": {
            "@type": "Person",
            "name": "Adam Lewis"
          }
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 42.8746,
          "longitude": 74.5698
        },
        "url": "https://www.example.com/restaurant-locations/manhattan",
        "telephone": `${process.env.NEXT_PUBLIC_PHONE_NUMBER}`,
        "priceRange": "$$$",
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday"
            ],
            "opens": "8:00",
            "closes": "17:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Wednesday",
              "Thursday",
              "Friday"
            ],
            "opens": "8:00",
            "closes": "17:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Saturday",
            "opens": "8:00",
            "closes": "17:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Sunday",
            "opens": "16:00",
            "closes": "22:00"
          }
        ],
        "breadcrumb": {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "GuideBook of Kyrgyzstan",
                "item": `${process.env.NEXT_PUBLIC_URL}/`
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "About Us",
                "item": `${process.env.NEXT_PUBLIC_URL}/about`
              }
            ]
        }
    }
    
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  };
  
export default Meta;
