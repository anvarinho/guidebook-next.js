// import Font Awesome CSS
// import "@fortawesome/fontawesome-svg-core/styles.css";
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '../../lib/dictionary'
import { Metadata } from 'next'

// import { config } from "@fortawesome/fontawesome-svg-core";
// import getWeatherData from "@/lib/getWeatherData";
// import getWikiResults from "@/lib/getWikiResults";
// Tell Font Awesome to skip adding the CSS automatically 
// since it's already imported above
// config.autoAddCss = false;
import styles from './page.module.css'
import Image from "next/image";
import DownloadApps from './Components/DownloadApps'
import HomePlaces from './Components/home/HomePlaces';
import Meta from './meta';
import Link from 'next/link';

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
      <Meta lang={lang} page={page}/>
      <div className={styles.home}>
        <h1>{page.home.title}</h1>
        <h2>{page.home.description}</h2>
        <div className={styles.buttons}>
          <Link href="#places" className={styles.floatingButton}>{page.home.button1}</Link>
          <Link href={`/${lang}/articles`} className={styles.floatingButton}>{page.home.button2}</Link>
          <Link href={`/${lang}/tours`} className={styles.floatingButton}>{page.home.button4}!</Link>
        </div>
        <div className={styles.chooseLanguage}>
          <h5>{translations[lang]}</h5>
          <Image src={'/arrow-down.png'} alt={'arrow down'} width={'30'} height={'30'} title='Arrow Down'/>
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
      applicationName:"GuideBook of Kyrgyzstan",
      category: "Travel",
      openGraph: {
        siteName:"GuideBook of Kyrgyzstan",
        type: "website",
        url: `${process.env.NEXT_PUBLIC_URL}/${lang}/`,
        title: page.home.title,
        description: page.home.description,
        images:[{
          url: `${process.env.NEXT_PUBLIC_URL}/karakolcablelift.jpg`,
          secureUrl: `${process.env.NEXT_PUBLIC_URL}/karakolcablelift.jpg`,
          width: 800,
          height: 600,
          alt: "Karakol Cable Lift",
          type:"image/jpeg"
        }],
        locale: page.langCode.replace("-",'_')
      },
      alternates: {
          canonical: `${process.env.NEXT_PUBLIC_URL}/${lang}`,
          languages: {
            "en-US": `${process.env.NEXT_PUBLIC_URL}/en/`,
            "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/`,
            "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/`,
            "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/`,
            "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/`,
            "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/`,
            "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/`,
            "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/`,
            "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/`,
            "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/`
          }
      },
      twitter: {
        card: "summary_large_image",
        title: page.home.title,
        description: page.home.description,
        siteId: "",
        creator: "@anvarinho",
        creatorId: "@anvarinho",
        images:[{
          url: `${process.env.NEXT_PUBLIC_URL}/uploads/bozteri.jpg`,
          width: 800,
          height: 600,
          alt: "Karakol Cable Lift"
        }]
      },
      robots: {
          index: true,
          follow: false,
          nocache: true,
          "max-image-preview":"large",
          googleBot: {
              index: true,
              follow: true,
          }
      }
  }
}
