import { Locale } from '@/lib/i18n.config'
import styles from './page.module.css'
import { getPlacesByURLs } from "@/lib/getAllPlaces"
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary'
import TourGallery from './TourGallery';
import { PlacesReveal } from '../../places/components/PlacesMotion';

type Params = {
    params: {
        day: Day,
        index: number,
        lang: Locale
    }
}

export default async function DayView({ params: {day, index, lang}}: Params) {
    const sights = await getPlacesByURLs(lang, day.places)
    const { page } = await getDictionary(lang)
    return (
        <section id={`day${index + 1}`} className={styles.daySection} aria-labelledby={`day-title-${index + 1}`}>
          <PlacesReveal className={`${styles.day} ${!day.images.length ? styles.dayWithoutImages : ''}`}>
            {day.images.length > 0 && <div className={styles.dayImages}>
              <TourGallery images={day.images} name={`${page.tours.tourPage.day} ${index + 1}`} lang={lang} priority={index === 0}/>
            </div>}
            <div className={styles.dayContent}>
              <div className={styles.dayHeading}>
                <span className={styles.dayNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3 id={`day-title-${index + 1}`}>{page.tours.tourPage.day} {index + 1}</h3>
              </div>
              <h4>{page.tours.tourPage.things}</h4>
              <ul className={styles.activities}>
                {day.activities.map((activity, i) => <li key={i}>{activity}</li>)}
              </ul>
              {sights.length > 0 && <>
                <h4>{page.tours.tourPage.places}</h4>
                <div className={styles.sights}>
                  {sights.map((sight: PlaceAlias) => (
                    <Link href={`/${lang}/places/${sight.url}`} className={styles.button} key={sight.url}>
                      {sight.name}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg>
                    </Link>
                  ))}
                </div>
              </>}
            </div>
          </PlacesReveal>
        </section>
    )
}
