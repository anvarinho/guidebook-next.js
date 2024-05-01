import styles from './articles.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import Image from "next/image";
import getAllArticles from '@/lib/getAllArticles';
import ArticleListItem from './components/ArticleListItem';
import React, { useState, useEffect, Suspense, lazy } from "react";
import LoadingSpinner from '../Components/LoadingSpinner';
import Meta from './meta';


export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const { page } = await getDictionary(lang)
  const data: Promise<[Article]> = getAllArticles(lang)
    const placesData = await data
    // const arrayImages = placesData.places.map((place) => place.image)
    // const images = getBlurredDataUrls(arrayImages)
    const content = placesData.map(async (article, i) => {
      return (
          <ArticleListItem key={i} article={article} lang={lang}/>
      )
    })
  return (
        <div className={styles.main}>
          <Meta articles={placesData} lang={lang} page={page}/>
          <h1>{page.articles.title}</h1>
          <h2>{page.articles.description}</h2>
          <div className={styles.articlesDiv}>
            <div className={styles.articlesList}>
              <Suspense fallback={<LoadingSpinner text={page.loading} />}>
                  {content}
                  <br />
              </Suspense>
            </div>
          </div>
        </div>
  )
}

export async function generateMetadata({
  params: {lang}
}: {
  params: {lang : Locale}
}): Promise<Metadata> {
  const { page } = await getDictionary(lang)
  return {
      title: {
        absolute: page.articles.title + ' | ' + page.name
      },
      description: page.articles.description,
      keywords: page.articles.keywords,
      applicationName:"GuideBook of Kyrgyzstan",
      category: "Travel",
      openGraph:{
        title:page.articles.title,
        description: page.articles.description,
        url: `${process.env.NEXT_PUBLIC_URL}/articles`,
        siteName: 'GuideBook of Kyrgyzstan',
        images: {
            url: `${process.env.NEXT_PUBLIC_URL}/uploads/alakul.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
        },
        locale: page.langCode.replace("-",'_'),
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: page.articles.title,
        description: page.articles.description,
        siteId: "",
        creator: "@anvarinho",
        creatorId: "@anvarinho",
        images: {
            url: `${process.env.NEXT_PUBLIC_URL}/uploads/alakul.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
        }
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
          url: `${process.env.NEXT_PUBLIC_URL}/articles`,
          should_fallback: true,
        }
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_URL}/articles/`,
        languages: {
            "en-US": `${process.env.NEXT_PUBLIC_URL}/en/articles/`,
            "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/articles/`,
            "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/articles/`,
            "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/articles/`,
            "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/articles/`,
            "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/articles/`,
            "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/articles/`,
            "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/articles/`,
            "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/articles/`,
            "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/articles/`
        }
    },
  }
}
