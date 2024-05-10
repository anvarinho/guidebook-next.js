import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import Team from './components/team'
import Clients from './components/clients'
import Meta from './meta'


export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const { page } = await getDictionary(lang)
  return (
    <div>
      <Meta/>
      <div className={styles.about}>
        <h1 className={styles.heading} data-aos="zoom-out">{page.about.title}</h1>
        <div className={styles.details} >
              <div className={styles.box}>
                <h3>{page.about.subtitle}</h3>
                <p>{page.about.description}</p>
                <div>
                <a href="#team" className={styles.floatingButton}>{page.about.buttons.our_team}</a>
                <a href="#clients" className={styles.floatingButton}>{page.about.buttons.our_clients}</a>
                </div>
              </div>
          </div>
      </div>
      <Clients params={{lang}}/>
      <Team params={{lang}}/>
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
      title: page.about.title,
      description: page.about.description,
      keywords: page.about.keywords,
      applicationName:"GuideBook of Kyrgyzstan",
      category: "Travel",
      openGraph:{
        title:page.about.title,
        description: page.about.description,
        url: `${process.env.NEXT_PUBLIC_URL}/about`,
        siteName: 'GuideBook of Kyrgyzstan',
        images: {
            url: `${process.env.NEXT_PUBLIC_URL}/uploads/tours/bel-tam.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
        },
        locale: page.langCode.replace("-",'_'),
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: page.about.title,
        description: page.about.description,
        siteId: "",
        creator: "@anvarinho",
        creatorId: "@anvarinho",
        images: {
            url: `${process.env.NEXT_PUBLIC_URL}/uploads/tours/bel-tam.jpg`,
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
          url: `${process.env.NEXT_PUBLIC_URL}/about`,
          should_fallback: false,
        }
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_URL}/${lang}/about/`,
        languages: {
            "en-US": `${process.env.NEXT_PUBLIC_URL}/en/about/`,
            "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/about/`,
            "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/about/`,
            "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/about/`,
            "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/about/`,
            "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/about/`,
            "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/about/`,
            "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/about/`,
            "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/about/`,
            "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/about/`
        }
    },
  }
}