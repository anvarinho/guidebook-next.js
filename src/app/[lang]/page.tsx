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
        <p>{page.home.description}</p>
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
      <div className={styles.travel}>
        <h2>{page.home.subtitle}</h2>
        <time dateTime={"2024-05-24 13:45:30"}>{page.info.modified}2024-05-24 13:45:30</time>
        <p>{page.home.paragraph}</p>
        <div>
          <h3>{page.home.Transportation.title}</h3>
          <p>{page.home.Transportation.Description}</p>
          {Object.entries(page.home.Transportation.Options).map(([key, value]: [string, string]) => (
            <p key={key}><b>{key}</b> : {value}</p>
          ))}
          {/* <p>{page.home.Transportation.details}</p> */}
        </div>
        <div>
          <h3>{page.home.Accommodations.title}</h3>
          <p>{page.home.Accommodations.Description}</p>
          {Object.entries(page.home.Accommodations.Options).map(([key, value]: [string, string]) => (
            <p key={key}><b>{key}</b> : {value}</p>
          ))}
          <p>{page.home.Accommodations.details}</p>
        </div>
        <div>
          <h3>{page.home.Food.title}</h3>
          <p>{page.home.Food.Description}</p>
          {Object.entries(page.home.Food.Options).map(([key, value]: [string, string]) => (
            <p key={key}><b>{key}</b> : {value}</p>
          ))}
          <p>{page.home.Food.details}</p>
        </div>
        <div>
          <h3>{page.home.Safety.title}</h3>
          <p>{page.home.Safety.Description}</p>
          {Object.entries(page.home.Safety.Options).map(([key, value]: [string, string]) => (
            <p key={key}><b>{key}</b> : {value}</p>
          ))}
          <p>{page.home.Safety.details}</p>
        </div>
        <div>
          <h3>{page.home.Prices.title}</h3>
          <p>{page.home.Prices.Description}</p>
          {Object.entries(page.home.Prices.Options).map(([key, value]: [string, string]) => (
            <p key={key}><b>{key}</b> : {value}</p>
          ))}
          <p>{page.home.Prices.details}</p>
        </div>
        <div>
          <h3>{page.home.Travel_Seasons.title}</h3>
          <p>{page.home.Travel_Seasons.Description}</p>
          {Object.entries(page.home.Travel_Seasons.Options).map(([key, value]: [string, string]) => (
            <p key={key}><b>{key}</b> : {value}</p>
          ))}
          <p>{page.home.Travel_Seasons.details}</p>
        </div>
        <div>
          <h3>{page.home.TravelPreparation.title}</h3>
          <p>{page.home.TravelPreparation.Description}</p>
          {Object.entries(page.home.TravelPreparation.Options).map(([key, value]: [string, string]) => (
            <p key={key}><b>{key}</b> : {value}</p>
          ))}
          <p>{page.home.TravelPreparation.details}</p>
        </div>
        <h2>{page.home.subtitle5}</h2>
      </div>
      <HomePlaces lang={lang}/>
      <div className={styles.travel}>
      <h2>{page.home.FirstTimeInKyrgyzstan.title}</h2>
        <div>
          <p>{page.home.FirstTimeInKyrgyzstan.Description}</p>
          {Object.entries(page.home.FirstTimeInKyrgyzstan.Options).map(([key, value]: [string, string]) => (
            <p key={key}><b>{key}</b> : {value}</p>
          ))}
          <p>{page.home.FirstTimeInKyrgyzstan.details}</p>
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
