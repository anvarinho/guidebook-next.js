import { Locale } from '@/lib/i18n.config'
import getTour from '@/lib/getTour';
import styles from './page.module.css'
import ImageSlider from '../../Components/image/ImageSlider';
import { Metadata } from 'next'
import { Suspense } from "react"
import LoadingSpinner from '../../Components/LoadingSpinner';
import DayView from './DayView';
import { getDictionary } from '@/lib/dictionary'
import Link from 'next/link';
import Meta from './meta';

type Params = {
    params: {
        tourUrl: string,
        lang: Locale
    }
}

export default async function Tour({ params: {tourUrl, lang}}: Params) {
    // const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
    const { page } = await getDictionary(lang)
    const tourData: Promise<TourInfo> = getTour(tourUrl, lang)
    const data = await tourData
    return (
        <div className={styles.main}>
            <Meta lang={lang} tour={data} page={page}/>
            <Suspense fallback={<LoadingSpinner text={"Loading"}/>}>
                {/* <JsonLD data={metaData} /> */}
                <article className={styles.article}>
                    <h1>{data.title}</h1>
                    <ImageSlider items={data.images}/>
                    <div className={styles.meta}>
                        <p><strong>{page.tours.tourPage.level}</strong>: {data.level}</p>
                        <p><strong>{page.tours.tourPage.duration}</strong>: {data.days.length} {data.days.length == 1 ? `${page.tours.tourPage.day}`: `${page.tours.tourPage.days}`}</p>
                        <p><strong>{page.tours.tourPage.price}</strong>: {data.price[data.price.length - 1]}$</p>
                    </div>
                    <h2>{data.description}</h2>
                    <h3>{page.tours.tourPage.details}</h3>
                    <div className={styles.daysNavigation}>
                        {data.days.map((day, index) => (
                            <Link href={`#day${index + 1}`} key={index}>{page.tours.tourPage.day}: {index + 1}</Link>
                        ))}
                        <Link href="#note">{page.tours.tourPage.note}</Link>
                    </div>
                    <br />
                    {data.days.map((day, index) => (
                        <DayView key={index} params={{ day: day, index: index, lang: lang }} />
                    ))}
                    <br />
                    <div id='note'>
                        <h3 className={styles.infoTitle}>{page.tours.tourPage.addInfo}</h3>
                        <div className={styles.infoList}>
                            {data.price.length > 1 && (
                                <div>
                                    <h4>{page.tours.tourPage.price}</h4>
                                    {data.price.map((fee, index) => (
                                        <p key={index}>
                                            {index + 1} {index === data.price.length - 1 ? page.tours.tourPage.andMore : (index === 0 ? page.tours.tourPage.person : page.tours.tourPage.persons)}: {fee}$
                                        </p>
                                    ))}
                                </div>
                            )}
                            <div>
                                <h4>{page.tours.tourPage.includings}</h4>
                                {data.includings.map((text, index) => (
                                    <p key={index}>{text}</p>
                                ))}
                            </div>
                            <div>
                                <h4>{page.tours.tourPage.excludings}</h4>
                                {data.excludings.map((text, index) => (
                                    <p key={index}>{text}</p>
                                ))}
                            </div>
                        </div>
                    </div>  
                </article>  
            </Suspense>
        </div>
    )
}

export async function generateMetadata({ params: {tourUrl, lang}}: Params): Promise<Metadata> {
    const tourData: Promise<TourInfo> = getTour(tourUrl, lang)
    const tour = await tourData
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
    const description = tour.description.substring(0, 200)
    const { page } = await getDictionary(lang)
    return {
        title: {
          absolute: tour.title
        },
        description: description,
        keywords: tour.keywords,
        applicationName: 'GuideBook of Kyrgyzstan',
        category: "Travel",
        openGraph: {
            title: tour.title + ' | ' + 'GuideBook of Kyrgyzstan',
            description: description,
            url: `${process.env.NEXT_PUBLIC_URL}/${lang}/tours/${tour.url}`,
            siteName: 'GuideBook of Kyrgyzstan',
            images: {
                url: `${process.env.NEXT_PUBLIC_URL}/${tour.images[0]}`,
                width: 800,
                height: 600,
                alt: tour.title
            },
            locale: page.langCode.replace("-",'_'),
            type: 'website',
        },
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_URL}/tours/${tour.url}`,
            languages: {
                "en-US": `${process.env.NEXT_PUBLIC_URL}/en/tours/${tour.url}`,
                "fr-FR": `${process.env.NEXT_PUBLIC_URL}/fr/tours/${tour.url}`,
                "de-DE": `${process.env.NEXT_PUBLIC_URL}/de/tours/${tour.url}`,
                "es-ES": `${process.env.NEXT_PUBLIC_URL}/es/tours/${tour.url}`,
                "ru-RU": `${process.env.NEXT_PUBLIC_URL}/ru/tours/${tour.url}`,
                "it-IT": `${process.env.NEXT_PUBLIC_URL}/it/tours/${tour.url}`,
                "ja-JP": `${process.env.NEXT_PUBLIC_URL}/jp/tours/${tour.url}`,
                "ko-KR": `${process.env.NEXT_PUBLIC_URL}/kr/tours/${tour.url}`,
                "ar-AE": `${process.env.NEXT_PUBLIC_URL}/ae/tours/${tour.url}`,
                "zh-CN": `${process.env.NEXT_PUBLIC_URL}/cn/tours/${tour.url}`
            }
        },
        twitter: {
            card: "summary_large_image",
            title: tour.title,
            description: description,
            siteId: "",
            creator: "@anvarinho",
            creatorId: "@anvarinho",
            images: {
                url: `${process.env.NEXT_PUBLIC_URL}/${tour.images[0]}`,
                width: 800,
                height: 600,
                alt: tour.title
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
              url: `${process.env.NEXT_PUBLIC_URL}/${lang}/tours/${tour.url}`,
              should_fallback: true,
            }
        },
        robots: {
            index: true,
            follow: true,
            nocache: true,
            googleBot: {
                index: true,
                follow: true,
            }
        }
    }
}
