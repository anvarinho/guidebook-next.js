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
import JsonLD from "../../Components/meta/JsonLD"

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
    const metaData = {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "GuideBook of Kyrgyzstan",
        url: `${process.env.NEXT_PUBLIC_URL}/${lang}/tours/${tourUrl}`,
        logo: `${process.env.NEXT_PUBLIC_URL}/favicon.ico`,
        description: "A comprehensive guidebook providing information about the culture, history, attractions, and practical travel tips for exploring Kyrgyzstan.",
        audience: {
          "@type": "Audience",
          "audienceType": "Tourists"
        },
        provider: {
          "@type": "Organization",
          "name": "GuideBook of Kyrgyzstan",
          "url": `${process.env.NEXT_PUBLIC_URL}`,
          "logo": `${process.env.NEXT_PUBLIC_URL}/favicon.ico`
        },
        // contactPoint: {
        //     "@type": "ContactPoint",
        //     "telephone": "+996500490806",
        //     "contactType": "Customer Service"
        // },
        offers: {
          "@type": "Offer",
          "priceCurrency": "USD",
          "price": `${data.price}`,
          "availability": "https://schema.org/InStock",
          "url": `${process.env.NEXT_PUBLIC_URL}/${lang}/tours/${tourUrl}`,
          "seller": {
            "@type": "Organization",
            "name": "GuideBook of Kyrgyzstan"
          }
        },
        aggregateRating: {
            "@type": "AggregateRating",
            "ratingValue": "4.5",
            "bestRating": "5",
            "worstRating": "0",
            "ratingCount": "100"
        },
        category: "Travel Guidebooks",
        // potentialAction: {
        //     "@type": "ContactAction",
        //     "contactType": "customer service",
        //     "telephone": "+996500490806"
        // }
    };
    return (
        <div className={styles.main}>
            <JsonLD data={metaData} />
            <Suspense fallback={<LoadingSpinner text={"Loading"}/>}>
                <article className={styles.article}>
                    <h1>{data.title}</h1>
                    <ImageSlider items={data.images}/>
                    <div className={styles.meta}>
                        <p><strong>{page.tours.tourPage.level}</strong>: {data.level}</p>
                        <p><strong>{page.tours.tourPage.duration}</strong>: {data.days.length} {data.days.length == 1 ? `${page.tours.tourPage.day}`: `${page.tours.tourPage.days}`}</p>
                        <p><strong>{page.tours.tourPage.price}</strong>: {data.price}$</p>
                    </div>
                    <h4>{data.description}</h4>
                    <h2>{page.tours.tourPage.details}</h2>
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
                        <h2 className={styles.infoTitle}>{page.tours.tourPage.addInfo}</h2>
                        <div className={styles.infoList}>
                            <div>
                                <h3>{page.tours.tourPage.includings}</h3>
                                {data.includings.map((text, index) => (
                                    <p key={index}>{text}</p>
                                ))}
                            </div>
                            <div>
                                <h3>{page.tours.tourPage.excludings}</h3>
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
    return {
        title: {
          absolute: tour.title
        },
        description: description,
        keywords: tour.keywords,
        applicationName: 'GuideBook of Kyrgyzstan',
        openGraph: {
            title: tour.title + ' | ' + 'GuideBook of Kyrgyzstan',
            description: description,
            url: baseUrl,
            siteName: 'GuideBook of Kyrgyzstan',
            images: {
                url: `${process.env.NEXT_PUBLIC_URL}/${tour.images[0]}`,
                width: 800,
                height: 600,
                alt: tour.title
            },
            locale: 'en_US',
            type: 'website',
        },
        alternates: {
            canonical: `tours/${tour.url}`,
            languages: {
                "en-US": `en/tours/${tour.url}`,
                "fr-FR": `fr/tours/${tour.url}`,
                "de-DE": `de/tours/${tour.url}`,
                "es-ES": `es/tours/${tour.url}`,
                "ru-RU": `ru/tours/${tour.url}`,
                "it-IT": `it/tours/${tour.url}`,
                "ja-JP": `jp/tours/${tour.url}`,
                "ko-KR": `kr/tours/${tour.url}`,
                "ar-AE": `ae/tours/${tour.url}`,
                "zh-CN": `cn/tours/${tour.url}`
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
