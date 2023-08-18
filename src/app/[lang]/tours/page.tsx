import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'


export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const { page } = await getDictionary(lang)
  return (
    <div className={styles.main}>
      <h1>{page.tours.title}</h1>
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
      absolute: page.tours.title + ' | ' + page.name
    },
      description: page.tours.description,
      keywords: page.tours.keywords,
  }
}