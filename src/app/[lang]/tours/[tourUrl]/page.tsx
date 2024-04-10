import { Locale } from '@/lib/i18n.config'
import getTour from '@/lib/getTour'
import styles from './page.module.css'
import ImageSlider from '../../Components/image/ImageSlider';
import { Metadata } from 'next'
import { Suspense } from "react"
import LoadingSpinner from '../../Components/LoadingSpinner';
import DayView from './DayView';

type Params = {
    params: {
        tourUrl: string,
        lang: Locale
    }
}

export default async function Tour({ params: {tourUrl, lang}}: Params) {
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
    const tourData: Promise<TourData> = getTour(tourUrl)
    const data = await tourData
    return (
        <div className={styles.main}>
            <Suspense fallback={<LoadingSpinner text={"Loading"}/>}>
                <article className={styles.article}>
                    <h1>{data.tour.title}</h1>
                    <ImageSlider items={data.tour.images}/>
                    <div className={styles.meta}>
                        <p>Level: <strong>Easy</strong></p>
                        <p>Duration: <strong>{data.tour.days.length} {data.tour.days.length == 1 ? "Day": "Days"}</strong></p>
                        <p>Price: <strong>340$</strong></p>
                    </div>
                    <h4>{data.tour.description}</h4>
                    {data.tour.days.map((day, index) => (
                        <DayView key={index} params={{ day: day, index: index, lang: lang }} />
                    ))}
                </article>  
            </Suspense>
        </div>
    )
}

export async function generateMetadata({ params: {tourUrl, lang}}: Params): Promise<Metadata> {
    const tourData: Promise<TourData> = getTour(tourUrl)
    const tour = await tourData
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
    return {
        title: {
          absolute: tour.tour.title
        },
        description: tour.tour.description,
        keywords: tour.tour.keywords,
    }
  }
