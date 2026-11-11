import { isRtlLocale } from '@/lib/localeMetadata';
import ArrowIcon from '@/components/ArrowIcon';
import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import Team from './components/team'
import Clients from './components/clients'
import Meta from './meta'
import Image from 'next/image'
import Link from 'next/link'
import { aboutContent } from './content'
import lake from '../../../../public/bozteri.jpg'
import yurt from '../../../../public/bozuy.jpg'


export default async function Home(
  props: {
    params: Promise<{lang : Locale}>
  }
) {
  const params = await props.params;

  const {
    lang
  } = params;

  const { page } = await getDictionary(lang)
  const copy = aboutContent[lang]
  const destinations = ['places', 'tours', 'articles']
  return (
    <article className={styles.about} dir={isRtlLocale(lang) ? 'rtl' : 'ltr'} aria-labelledby="about-title">
      <Meta lang={lang} page={page}/>
      <div className={styles.container}>
        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{page.about.subtitle}</p>
            <h1 className={styles.heading} id="about-title">{page.about.title}</h1>
            <p className={styles.lead}>{copy.intro}</p>
            <div className={styles.heroActions}>
              <a href="#team" className={styles.primaryButton}>{page.about.buttons.our_team}<span aria-hidden="true"><ArrowIcon direction="down-right"/></span></a>
              <Link href={`/${lang}/contact`} className={styles.secondaryButton}>{page.about.buttons.contact_us}</Link>
            </div>
          </div>
          <div className={styles.visualComposition}>
            <figure className={styles.visualCard}>
              <div className={styles.imageFrame}>
                <Image src={lake} alt={copy.landscape} fill priority placeholder="blur" sizes="(max-width: 760px) 92vw, 52vw" className={styles.visualImage}/>
              </div>
              <figcaption className={styles.visualCaption}><span className={styles.locationDot}/>{copy.landscape}</figcaption>
            </figure>
            <figure className={styles.insetPhoto}>
              <Image src={yurt} alt={copy.yurt} placeholder="blur" sizes="(max-width: 760px) 40vw, 220px"/>
              <figcaption>{copy.yurt}</figcaption>
            </figure>
          </div>
        </header>
        <section className={styles.story} aria-labelledby="story-heading">
          <div data-motion="rise"><p className={styles.eyebrow}>01 / {page.about.subtitle}</p><h2 id="story-heading">{copy.story}</h2></div>
          <div data-motion="rise"><p className={styles.storyText}>{page.about.description}</p><a href="#clients" className={styles.textLink}>{page.about.buttons.our_clients}<span aria-hidden="true"><ArrowIcon direction="up-right"/></span></a></div>
        </section>
        <section className={styles.explore} aria-labelledby="explore-heading">
          <div data-motion="rise"><h2 id="explore-heading">{copy.explore}</h2></div>
          <div className={styles.exploreGrid}>
            {copy.cards.map(([title, body], index) => <div key={destinations[index]} className={styles.exploreReveal} data-motion="rise">
              <Link href={`/${lang}/${destinations[index]}`} className={styles.exploreCard}>
                <span className={styles.cardTop}><span className={styles.cardNumber} aria-hidden="true">0{index + 1}</span><span className={styles.arrow} aria-hidden="true"><ArrowIcon direction="up-right"/></span></span>
                <h3>{title}</h3><p>{body}</p>
              </Link>
            </div>)}
          </div>
        </section>
      </div>
      <Team params={{lang}}/>
      <Clients params={{lang}}/>
      <div className={styles.container}>
        <section className={styles.journey} aria-labelledby="journey-heading">
          <div data-motion="rise"><p className={styles.eyebrow}>04 / {page.about.buttons.contact_us}</p><h2 id="journey-heading">{copy.journey}</h2></div>
          <ol className={styles.steps}>{copy.steps.map(([title, body], index) => <li key={title}><div data-motion="rise"><span className={styles.stepNumber} aria-hidden="true">0{index + 1}</span><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
        </section>
        <div className={styles.invitation} data-motion="rise">
          <div className={styles.invitationCopy}><h2>{copy.invitation}</h2><p>{copy.invitationBody}</p><Link href={`/${lang}/contact`} className={styles.primaryButton}>{page.about.buttons.contact_us}<span aria-hidden="true"><ArrowIcon direction="up-right"/></span></Link></div>
          <div className={styles.invitationArt} aria-hidden="true"><span/><span/><span/></div>
        </div>
      </div>
    </article>
    
  )
}

export async function generateMetadata(
  props: {
    params: Promise<{lang : Locale}>
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    lang
  } = params;

  const { page } = await getDictionary(lang)
  const siteUrl = (process.env.SITE_URL || 'https://central-asia.live').replace(/\/$/, '')
  const pageUrl = `${siteUrl}/${lang}/about/`
  const imageUrl = `${siteUrl}/bozteri.jpg`
  return {
      metadataBase: new URL(`${siteUrl}/`),
      title: {
        absolute: `${page.about.title} | GuideBook of Kyrgyzstan`
      },
      description: page.about.description,
      keywords: page.about.keywords,
      applicationName:"GuideBook of Kyrgyzstan",
      category: "Travel",
      authors: [{ name: 'GuideBook of Kyrgyzstan', url: siteUrl }],
      publisher: 'GuideBook of Kyrgyzstan',
      openGraph:{
        title:`${page.about.title} | GuideBook of Kyrgyzstan`,
        description: page.about.description,
        url: pageUrl,
        siteName: 'GuideBook of Kyrgyzstan',
        images: [{
            url: imageUrl,
            secureUrl: imageUrl,
            width: 800,
            height: 600,
            alt: "Issyk-Kul Lake, Kyrgyzstan",
            type:"image/jpeg"
        }],
        locale: page.langCode.replace("-",'_'),
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: `${page.about.title} | GuideBook of Kyrgyzstan`,
        description: page.about.description,
        creator: "@anvarinho",
        images: [{
            url: imageUrl,
            width: 800,
            height: 600,
            alt: "Issyk-Kul Lake, Kyrgyzstan"
        }]
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
          url: pageUrl,
          should_fallback: false,
        }
      },
      alternates: {
        canonical: pageUrl,
        languages: {
            "en-US": `${siteUrl}/en/about/`,
            "fr-FR": `${siteUrl}/fr/about/`,
            "de-DE": `${siteUrl}/de/about/`,
            "es-ES": `${siteUrl}/es/about/`,
            "ru-RU": `${siteUrl}/ru/about/`,
            "it-IT": `${siteUrl}/it/about/`,
            "ja-JP": `${siteUrl}/jp/about/`,
            "ko-KR": `${siteUrl}/kr/about/`,
            "ar-AE": `${siteUrl}/ae/about/`,
            "zh-CN": `${siteUrl}/cn/about/`,
            "x-default": `${siteUrl}/en/about/`
        }
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}
