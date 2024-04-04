import { Locale } from '@/lib/i18n.config'
import styles from './page.module.css'
import ImageSlider from '../../Components/image/ImageSlider';
import { getPlacesByURLs } from "@/lib/getAllPlaces"
import Link from 'next/link';

type Params = {
    params: {
        day: Day,
        index: number,
        lang: Locale
    }
}

export default async function DayView({ params: {day, index, lang}}: Params) {
    // const baseUrl = 'http://159.65.95.44/';
    const sights = await getPlacesByURLs(lang, day.places)
    console.log(sights)
    return (
        <div key={index} className={styles.day}>
            <h2>Day: {index + 1}</h2>
            <br />
            <div className={styles.dayImages}>
                <ImageSlider items={day.images}/>
            </div>
            <br />
            <h3>Things we do</h3>
            {day.activities.map((activity, i) => (
                <p key={i}>{activity}</p>
            ))}
            <h3>Places we go</h3>
            <div className={styles.sights}>
                {sights.map((sight: any, index: number) => {
                    return (
                        <Link href={`/${lang}/places/${sight.url}`} className={styles.button} key={index}>{sight.name}</Link>
                    );
                })}
            </div>
        </div>
    )
}