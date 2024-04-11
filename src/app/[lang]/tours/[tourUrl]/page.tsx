import { Locale } from '@/lib/i18n.config'
import getTour from '@/lib/getTour';
import styles from './page.module.css'
import ImageSlider from '../../Components/image/ImageSlider';
import { Metadata } from 'next'
import { Suspense } from "react"
import LoadingSpinner from '../../Components/LoadingSpinner';
import DayView from './DayView';
import { getDictionary } from '@/lib/dictionary'

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
            <Suspense fallback={<LoadingSpinner text={"Loading"}/>}>
                <article className={styles.article}>
                    <h1>{data.title}</h1>
                    <ImageSlider items={data.images}/>
                    <div className={styles.meta}>
                        <p>{page.tours.tourPage.level}: <strong>{data.level}</strong></p>
                        <p>{page.tours.tourPage.duration}: <strong>{data.days.length} {data.days.length == 1 ? `${page.tours.tourPage.day}`: `${page.tours.tourPage.days}`}</strong></p>
                        <p>{page.tours.tourPage.price}: <strong>{data.price}$</strong></p>
                    </div>
                    <h4>{data.description}</h4>
                    <h2>{page.tours.tourPage.details}</h2>
                    <br />
                    {data.days.map((day, index) => (
                        <DayView key={index} params={{ day: day, index: index, lang: lang }} />
                    ))}
                    <br />
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
                </article>  
            </Suspense>
        </div>
    )
}

export async function generateMetadata({ params: {tourUrl, lang}}: Params): Promise<Metadata> {
    const tourData: Promise<TourInfo> = getTour(tourUrl, lang)
    const tour = await tourData
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
    return {
        title: {
          absolute: tour.title
        },
        description: tour.description,
        keywords: tour.keywords,
    }
  }
