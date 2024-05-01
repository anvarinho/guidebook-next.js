import { Locale } from "@/lib/i18n.config";

interface Props {
    articles: [Article];
    lang: Locale
    page: any
}

const Meta: React.FC<Props> = ({ lang, articles, page }) => {
  const itemListElement = articles.map((article, index) => {
    const dateModifiedISO = new Date(article.createdAt).toISOString();
    return {
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": article.title,
        "url": `${process.env.NEXT_PUBLIC_URL}/${lang}/articles/${article.url}`,
        "datePublished": dateModifiedISO,
        "dateModified": dateModifiedISO,
        "author": {
          "@type": "Person",
          "url": "https://fb.com/anvarinho",
          "name": "Anvar Jumabaev"
        },
        "publisher": {
          "@type": "Organization",
          "name": "GuideBook of Kyrgyzstan",
          "logo": {
            "@type": "ImageObject",
            "url": `${process.env.NEXT_PUBLIC_URL}/favicon.ico`
          }
        },
        "description": article.subtitle,
        "image": {
          "@type": "ImageObject",
          "url": `${process.env.NEXT_PUBLIC_URL}/${article.image ? article.image : article.paragraphs[0].image}`,
          "width": 800,
          "height": 600
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${process.env.NEXT_PUBLIC_URL}/articles/${article.url}`
        }
      },
      "breadcrumb": {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": page.articles.name,
            "item": `${process.env.NEXT_PUBLIC_URL}/${lang}/articles`
          }
        ]
      },
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