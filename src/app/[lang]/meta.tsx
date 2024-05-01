import { Locale } from "@/lib/i18n.config";

interface Props {
    lang: Locale
    page: any; // Assuming 'tour' is a string, adjust the type accordingly if it's different
}

const Meta: React.FC<Props> = ({ lang, page }) => {  

    const data = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "GuideBook of Kyrgyzstan",
        "url": `${process.env.NEXT_PUBLIC_URL}/${lang}`,
        "title": page.home.title,
        "description": page.home.description,
        "inLanguage": page.langCode,
        "image":`${process.env.NEXT_PUBLIC_URL}/karakolcablelift.jpg`,
        "author": {
          "@type": "Organization",
          "name": "GuideBook of Kyrgyzstan"
        },
        // "potentialAction": {
        //   "@type": "SearchAction",
        //   "target": {
        //     "@type": "EntryPoint",
        //     "urlTemplate": `${process.env.NEXT_PUBLIC_URL}/search?q={search_term_string}`
        //   },
        //   "query-input": "required name=search_term_string"
        // },
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "telephone": `${process.env.NEXT_PUBLIC_PHONE_NUMBER}`,
          "email":`${process.env.NEXT_PUBLIC_EMAIL}`,
        }
    }    
    
    const newData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "GuideBook of Kyrgyzstan",
        "url": `${process.env.NEXT_PUBLIC_URL}/${lang}`,
        "title": page.home.title,
        "description": page.home.description,
        "inLanguage": page.langCode,
        "image":`${process.env.NEXT_PUBLIC_URL}/karakolcablelift.jpg`,
        "author": {
          "@type": "Organization",
          "name": "GuideBook of Kyrgyzstan"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer support",
            "telephone": `${process.env.NEXT_PUBLIC_PHONE_NUMBER}`,
            "email":`${process.env.NEXT_PUBLIC_EMAIL}`,
          },
        // "potentialAction": {
        //   "@type": "SearchAction",
        //   "target": {
        //     "@type": "EntryPoint",
        //     "urlTemplate": "YOUR_SEARCH_URL?q={search_term_string}"
        //   },
        //   "query-input": "required name=search_term_string"
        // },
        "breadcrumb": {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": page.name,
              "item": `${process.env.NEXT_PUBLIC_URL}/${lang}`
            }
          ]
        }
    }
      
  
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newData) }}
      />
    );
  };
  
  export default Meta;