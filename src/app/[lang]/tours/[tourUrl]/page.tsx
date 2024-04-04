import { Locale } from '@/lib/i18n.config'
import getTour from '@/lib/getTour'
import styles from './page.module.css'
import ImageSlider from '../../Components/image/ImageSlider';
import { Metadata } from 'next'

type Params = {
    params: {
        tourUrl: string,
        lang: Locale
    }
}

export default async function Tour({ params: {tourUrl, lang}}: Params) {
    const baseUrl = 'http://159.65.95.44/';
    const tourData: Promise<TourData> = getTour(tourUrl)
    const data = await tourData
    return (
        <div className={styles.main}>
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
                    <div key={index} className={styles.day}>
                        <h2>Day: {index + 1}</h2>
                        <div className={styles.dayImages}>
                        <ImageSlider items={day.images}/>
                            {/* {day.images.map((image, ind) => (
                                <Image key={ind} src={baseUrl + image} alt={image} width={350} height={230} objectFit='contain'/>
                            ))} */}
                        </div>
                        
                        {day.activities.map((activity, i) => (
                            <p key={i}>{activity}</p>
                        ))}
                    </div>
                ))}

            </article>  
        </div>
    )
}

export async function generateMetadata({ params: {tourUrl, lang}}: Params): Promise<Metadata> {
    const tourData: Promise<TourData> = getTour(tourUrl)
    const tour = await tourData
    const baseUrl = 'http://127.0.0.1:4000/';
    return {
        title: {
          absolute: tour.tour.title
        },
        description: tour.tour.description,
        keywords: tour.tour.keywords,
    }
  }
