import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import Image from "next/image";
import getArticle from '@/lib/getArticle';
import Article from './components/Article'
import { Suspense } from "react"
import LoadingSpinner from '../../Components/LoadingSpinner';

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
  // const baseUrl = 'http://127.0.0.1:4000/';
  return (
    <div className={styles.main}>
      <Suspense fallback={<LoadingSpinner text={"page.loading"}/>}>
        <Article article={article} lang={lang}/>
      </Suspense>
    </div>
  )
}

export async function generateMetadata({ params: {articleUrl, lang}}: Params): Promise<Metadata> {
  const data: Promise<Article> = getArticle(articleUrl, lang)
  const article = await data
  // const baseUrl = 'http://127.0.0.1:4000/';
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
            url: `${process.env.NEXT_PUBLIC_URL}/${article.image}`,
            width: 800,
            height: 600,
            alt: article.title
          }],
          locale: 'en_US',
          type: 'website',
      },
      alternates: {
        canonical: `en/articles/${article.url}`,
        languages: {
            "en-EN": `en/articles/${article.url}`,
            "fr-FR": `fr/articles/${article.url}`,
            "de-DE": `de/articles/${article.url}`,
            "es-ES": `es/articles/${article.url}`,
            "ru-RU": `ru/articles/${article.url}`,
            "it-IT": `it/articles/${article.url}`,
            "jp-JP": `jp/articles/${article.url}`,
            "kr-KR": `kr/articles/${article.url}`,
            "ae-AE": `ae/articles/${article.url}`,
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
        url: `${process.env.URL}/${article.image}`,
        width: 800,
        height: 600,
        alt: article.title
      }]
    },
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: true,
            follow: true,
        }
    }
  }
}