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
  const baseUrl = 'http://127.0.0.1:4000/';
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
  const baseUrl = 'http://127.0.0.1:4000/';
  return {
      title: {
        absolute: article.title
      },
      description: article.subtitle,
      keywords: article.keywords,
  }
}