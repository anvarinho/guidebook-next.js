
interface Props {
    tours: [Tour]; // Assuming 'tour' is a string, adjust the type accordingly if it's different
    title: String
    description: String
}

const Meta: React.FC<Props> = ({ tours, title, description }) => {
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
          "name": title,
          "description": description,
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
          "hasVariant": variants
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