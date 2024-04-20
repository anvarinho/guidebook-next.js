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
  }
}
