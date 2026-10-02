import ArrowIcon from '@/components/ArrowIcon';
import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import getArticle from '@/lib/getArticle';
import Article from './components/Article'
import { Suspense } from "react"
import LoadingSpinner from '../../Components/LoadingSpinner';
import Meta from './meta';
import { getDictionary } from '@/lib/dictionary'
import { notFound } from 'next/navigation'
import shared from '../../places/page.module.css';
import { PlacesReveal } from '../../places/components/PlacesMotion';
import { absoluteSiteUrl, localizedAlternates, metaDescription, siteUrl } from '@/lib/seo';

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
  if (!article) notFound()
  return (
    <div className={styles.main} dir={lang === 'ae' ? 'rtl' : 'ltr'}>
      <Meta lang={lang} article={article} page={page}/>
      <Suspense fallback={<LoadingSpinner text={page.loading} detail/>}>
        <header className={styles.articleHeader}>
          <PlacesReveal className={styles.headerCopy}>
            <a href={`/${lang}/articles`} className={styles.breadcrumb}>
              <span aria-hidden="true"><ArrowIcon direction={lang === 'ae' ? 'right' : 'left'}/></span>{page.articles.name}
            </a>
            <p className={shared.eyebrow}>{page.articles.name}</p>
            <h1>{article.title}</h1>
            <p className={styles.subtitle}>{article.subtitle}</p>
            <div className={styles.articleMeta}>
              <time dateTime={new Date(article.createdAt).toISOString()}>{new Date(article.createdAt).toLocaleDateString(page.langCode, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time>
              <span aria-hidden="true">·</span>
              <span>{page.info.seen}{new Intl.NumberFormat(page.langCode).format(article.viewCount)}</span>
            </div>
          </PlacesReveal>
          <PlacesReveal className={styles.headerRule} order={1} aria-hidden="true"><span/></PlacesReveal>
        </header>
        <Article article={article} lang={lang}/>
      </Suspense>
    </div>
  )
}

export async function generateMetadata({ params: {articleUrl, lang}}: Params): Promise<Metadata> {
  const article = await getArticle(articleUrl, lang)
  if (!article) notFound()
  const { page } = await getDictionary(lang)
  const imagePath = article.image || article.paragraphs.find((paragraph: Paragraph) => paragraph.image)?.image
  const description = metaDescription(article.subtitle, article.paragraphs[0]?.text)
  const pageUrl = absoluteSiteUrl(`${lang}/articles/${encodeURIComponent(article.url)}`)
  const images = imagePath ? [{ url: absoluteSiteUrl(imagePath), alt: article.title }] : []
  const publishedTime = new Date(article.createdAt).toISOString()
  return {
    metadataBase: new URL(`${siteUrl}/`),
    title: article.title,
    description,
    keywords: article.keywords,
    applicationName: 'GuideBook of Kyrgyzstan',
    category: 'Travel',
    openGraph: {
      title: article.title,
      description,
      url: pageUrl,
      siteName: 'GuideBook of Kyrgyzstan',
      images,
      locale: page.langCode.replace('-', '_'),
      type: 'article',
      publishedTime,
      authors: ['Anvar Jumabaev'],
    },
    alternates: {
      canonical: pageUrl,
      languages: localizedAlternates('articles', article.url),
    },
    twitter: {
      card: images.length ? 'summary_large_image' : 'summary',
      title: article.title,
      description,
      creator: '@anvarinho',
      images: images.map(image => image.url),
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  }
}
