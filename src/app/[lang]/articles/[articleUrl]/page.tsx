import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import getArticle from '@/lib/getArticle';
import Article from './components/Article'
import { Suspense } from "react"
import LoadingSpinner from '../../Components/LoadingSpinner';
import Meta from './meta';
import { getDictionary } from '@/lib/dictionary'

type Params = {
  params: {
      articleUrl: string,
      name: string,
      lang: Locale
  }
}

export default async function Home({ params: {articleUrl, lang}}: Params) {
  const { page } = await getDictionary(lang)
  const data: Promise<Article> = getArticle(articleUrl, lang)
  const article = await data
  
  return (
    <div className={styles.main}>
      <Meta lang={lang} article={article} page={page}/>
      <Suspense fallback={<LoadingSpinner text={"page.loading"}/>}>
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
      category: "Travel",
      openGraph: {
          title: article.title + ' | ' + 'GuideBook of Kyrgyzstan',
          description: article.subtitle,
          url: `${process.env.NEXT_PUBLIC_URL}/${lang}/articles/${article.url}`,
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
        canonical: `${process.env.NEXT_PUBLIC_URL}/articles/${article.url}`,
        languages: {
            "en-US": `${process.env.NEXT_PUBLIC_URL}/en/articles/${article.url}`,
            "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/articles/${article.url}`,
            "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/articles/${article.url}`,
            "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/articles/${article.url}`,
            "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/articles/${article.url}`,
            "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/articles/${article.url}`,
            "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/articles/${article.url}`,
            "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/articles/${article.url}`,
            "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/articles/${article.url}`,
            "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/articles/${article.url}`
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
    appLinks: {
      ios: {
        url: "https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810",
        app_store_id: "id1575382810",
        app_name: "GuideBook of Kyrgyzstan"
      },
      android: {
        url: "https://play.google.com/store/apps/details?id=com.anvarinho.guidebook",
        package: "com.anvarinho.guidebook",
        app_name: "GuideBook of Kyrgyzstan"
      },
      web: {
        url: `${process.env.NEXT_PUBLIC_URL}/${lang}/articles/${article.url}`,
        should_fallback: true,
      }
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