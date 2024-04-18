import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import getArticle from '@/lib/getArticle';
import Article from './components/Article'
import { Suspense } from "react"
import LoadingSpinner from '../../Components/LoadingSpinner';
import JsonLD from "../../Components/meta/JsonLD"

type Params = {
  params: {
      articleUrl: string,
      name: string,
      lang: Locale
  }
}

export default async function Home({ params: {articleUrl, lang}}: Params) {
  // const { page } = await getDictionary(lang)
  const data: Promise<Article> = getArticle(articleUrl, lang)
  const article = await data
  const metaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    url: `${process.env.NEXT_PUBLIC_URL}/${lang}/articles/${article.url}`,
    datePublished: article.createdAt,
    dateModified: article.createdAt,
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
    <div className={styles.main}>
      <Suspense fallback={<LoadingSpinner text={"page.loading"}/>}>
        <JsonLD data={metaData} />
        <Article article={article} lang={lang}/>
      </Suspense>
    </div>
  )
}

export async function generateMetadata({ params: {articleUrl, lang}}: Params): Promise<Metadata> {
  const data: Promise<Article> = getArticle(articleUrl, lang)
  const article = await data
  let imageUrl = article.image ? article.image : article.paragraphs[0].image
  return {
      title: {
        absolute: article.title
      },
      description: article.subtitle,
      keywords: article.keywords,
      applicationName: 'GuideBook of Kyrgyzstan',
      openGraph: {
          title: article.title + ' | ' + 'GuideBook of Kyrgyzstan',
          description: article.subtitle,
          url: `${process.env.NEXT_PUBLIC_URL}/`,
          siteName: 'GuideBook of Kyrgyzstan',
          images: [{
            url: `${process.env.NEXT_PUBLIC_URL}/${imageUrl}`,
            width: 800,
            height: 600,
            alt: article.title
          }],
          locale: 'en_US',
          type: 'website',
      },
      alternates: {
        canonical: `articles/${article.url}`,
        languages: {
            "en-US": `en/articles/${article.url}`,
            "fr-FR": `fr/articles/${article.url}`,
            "de-DE": `de/articles/${article.url}`,
            "es-ES": `es/articles/${article.url}`,
            "ru-RU": `ru/articles/${article.url}`,
            "it-IT": `it/articles/${article.url}`,
            "ja-JP": `jp/articles/${article.url}`,
            "ko-KR": `kr/articles/${article.url}`,
            "ar-AE": `ae/articles/${article.url}`,
            "zh-CN": `cn/articles/${article.url}`
        }
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.subtitle,
      siteId: "@anvarinho",
      creator: "@anvarinho",
      creatorId: "@anvarinho",
      images: [{
        url: `${process.env.URL}/${imageUrl}`,
        width: 800,
        height: 600,
        alt: article.title
      }]
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
        }
    }
  }
}