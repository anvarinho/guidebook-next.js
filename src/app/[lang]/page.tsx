// import Font Awesome CSS
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '../../lib/dictionary'
import { Metadata } from 'next'

import { config } from "@fortawesome/fontawesome-svg-core";
import getWeatherData from "@/lib/getWeatherData";
import getWikiResults from "@/lib/getWikiResults";
// Tell Font Awesome to skip adding the CSS automatically 
// since it's already imported above
config.autoAddCss = false;
import styles from './page.module.css'
import  Footer  from './Components/Footer'

export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const { page } = await getDictionary(lang)
  // const router = useRouter()
  // const wikiData = getWeatherData("Osh")
  // const data = await wikiData
  // console.log(page)
  return (
    <div className={styles.mainDiv}>
      <h1>{page.home.title}</h1>
      <h4>{page.home.description}</h4>
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
      title: page.home.title,
      description: page.home.description,
      keywords: page.home.keywords,
  }
}
