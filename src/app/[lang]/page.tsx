// import Font Awesome CSS
// import "@fortawesome/fontawesome-svg-core/styles.css";
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '../../lib/dictionary'
import { Metadata } from 'next'

// import { config } from "@fortawesome/fontawesome-svg-core";
import getWeatherData from "@/lib/getWeatherData";
import getWikiResults from "@/lib/getWikiResults";
// Tell Font Awesome to skip adding the CSS automatically 
// since it's already imported above
// config.autoAddCss = false;
import styles from './page.module.css'
import Image from "next/image";
import DownloadApps from './Components/DownloadApps'
import HomePlaces from './Components/home/HomePlaces';

export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const { page } = await getDictionary(lang)

  const translations = {
    en: "Choose language",
    de: "Sprache wählen",
    es: "Elegir idioma",
    fr: "Choisir la langue",
    it: "Scegli la lingua",
    kr: "언어 선택",
    jp: "言語を選択",
    cn: "选择语言",
    ru: "Выберите язык",
    ae: "اختر اللغة",
  };

  return (
    <div className={styles.main}>
      <div className={styles.home}>
        <h1>{page.home.title}</h1>
        <h4>{page.home.description}</h4>
        <div className={styles.buttons}>
        <a href="#places" className={styles.floatingButton}>{page.home.button1}</a>
        <a href="#places" className={styles.floatingButton}>{page.home.button2}</a>
        </div>
        
        <div className={styles.chooseLanguage}>
          <h5>{translations[lang]}</h5>
          <Image src={'/arrow-down.png'} alt={'arrow down'} width={'30'} height={'30'}/>
        </div>
        <div className={styles.downloadApps}>
            <DownloadApps/>
        </div>
      </div>
      <HomePlaces lang={lang}/>
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
      openGraph: {
        images:{
          url: `${process.env.NEXT_PUBLIC_URL}/karakolcablelift.jpg`,
        }
      },
      alternates: {
          canonical: `en/`,
          languages: {
            "en-EN": "en",
            "fr-FR": "fr",
            "de-DE": "de",
            "es-ES": "es",
            "ru-RU": "ru",
            "it-IT": "it",
            "jp-JP": "jp",
            "kr-KR": "kr",
            "ae-AE": "ae",
            "zh-CN": "cn"
          }
      },
      twitter: {
        card: "summary_large_image",
        title: page.home.title,
        description: page.home.description,
        siteId: "",
        creator: "@anvarinho",
        creatorId: "@anvarinho",
        images:{
          url: `${process.env.NEXT_PUBLIC_URL}/karakolcablelift.jpg`,
        }
      },
      robots: {
          index: true,
          follow: false,
          nocache: true,
          googleBot: {
              index: true,
              follow: true,
          }
      }
  }
}
