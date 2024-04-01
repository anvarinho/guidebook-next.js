import { Locale } from '@/lib/i18n.config'
import getTour from '@/lib/getTour'
import Image from "next/image";
import styles from '../page.module.css'

type Params = {
    params: {
        tourUrl: string,
        lang: Locale
    }
}

export default async function Tour({ params: {tourUrl, lang}}: Params) {
    const baseUrl = 'http://127.0.0.1:4000/';
    const tourData: Promise<TourData> = getTour(tourUrl)
    const data = await tourData
    return (
        <div className={styles.main}>
            <article className={styles.article}>
                <h1>{data.tour.title}</h1>
                {data.tour.images.map((image, index) => (
                    <Image key={index} src={baseUrl + image} alt={image} width={600} height={400}/>
                ))}
                <h4>{data.tour.description}</h4>
                {data.tour.days.map((day, index) => (
                    <div key={index} className={styles.day}>
                        <h2>Day: {index + 1}</h2>
                        <div className={styles.dayImages}>
                            {day.images.map((image, ind) => (
                                <Image key={ind} src={baseUrl + image} alt={image} width={350} height={230} objectFit='contain'/>
                            ))}
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
