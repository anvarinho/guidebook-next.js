import { Locale } from "@/lib/i18n.config";

interface Props {
    lang: Locale
    tours: [Tour]; // Assuming 'tour' is a string, adjust the type accordingly if it's different
    page: any
}

const Meta: React.FC<Props> = ({ lang, tours, page }) => {
    const variants = tours.map((tour) => {
        return {
          "@type": "Product",
          "sku": tour._id,
          // "gtin14": tour.gtin14,
          "image": tour.images,
          "name": tour.title,
          "description": tour.description,
          "offers": {
            "@type": "Offer",
            "url": tour.url,
            "priceCurrency": "USD",
            "price": tour.lastPrice,
            "availability": "https://schema.org/InStock",
          }
        };
      });
      const data = [
        {
          "@context": "https://schema.org/",
          "@type": "ProductGroup",
          "name": page.tours.title,
          "description": page.tours.description,
          "url": `${process.env.NEXT_PUBLIC_URL}/tours`,
          "brand": {
            "@type": "Brand",
            "name": "GuideBook of Kyrgyzstan"
          },
          "audience": {
            "@type": "PeopleAudience",
            "audienceType": "Tourists"
          },
          "productGroupID": "44E01",
          "hasVariant": variants,
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
                "item": `${process.env.NEXT_PUBLIC_URL}/${lang}/places`
              }
            ]
          },
        }
      ]
    
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  };
  
  export default Meta;