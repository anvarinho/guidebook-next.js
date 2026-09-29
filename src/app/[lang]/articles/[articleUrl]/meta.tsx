import { Locale } from "@/lib/i18n.config";
import { absoluteSiteUrl, metaDescription, safeJsonLd } from "@/lib/seo";

interface Props {
  article: Article;
  lang: Locale;
  page: any;
}

export default function Meta({ lang, article, page }: Props) {
  const url = absoluteSiteUrl(`${lang}/articles/${encodeURIComponent(article.url)}`);
  const imagePath = article.image || article.paragraphs.find(paragraph => paragraph.image)?.image;
  const description = metaDescription(article.subtitle, article.paragraphs[0]?.text);
  const publishedDate = new Date(article.createdAt);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        url,
        headline: article.title,
        name: article.title,
        description,
        ...(imagePath ? { image: [absoluteSiteUrl(imagePath)] } : {}),
        ...(Number.isNaN(publishedDate.getTime()) ? {} : { datePublished: publishedDate.toISOString() }),
        inLanguage: page.langCode,
        author: {
          "@type": "Person",
          name: "Anvar Jumabaev",
        },
        publisher: {
          "@type": "Organization",
          name: "GuideBook of Kyrgyzstan",
          url: absoluteSiteUrl(""),
        },
        mainEntityOfPage: { "@id": `${url}#webpage` },
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: article.title,
        description,
        inLanguage: page.langCode,
        mainEntity: { "@id": `${url}#article` },
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: page.articles.name, item: absoluteSiteUrl(`${lang}/articles`) },
          { "@type": "ListItem", position: 2, name: article.title, item: url },
        ],
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />;
}
