import { Locale } from "@/lib/i18n.config";

interface Props {
    article: Article;
    lang: Locale
}

const Meta: React.FC<Props> = ({ lang, article }) => {
    const data = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        url: `${process.env.NEXT_PUBLIC_URL}/${lang}/articles/${article.url}`,
        datePublished: article.createdAt,
        dateModified: article.createdAt,
        author: {
          "@type": "Person",
          "url":"https://fb.com/anvarinho",
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
        description: article.subtitle,
        image: {
          "@type": "ImageObject",
          url: `${process.env.NEXT_PUBLIC_URL}/${article.image ? article.image : article.paragraphs[0].image}`,
          width: 800,
          height: 600
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${process.env.NEXT_PUBLIC_URL}/articles/${article.url}`
        }
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      />
    );
  };
  
  export default Meta;