import styles from './page.module.css'
import { getDictionary } from '@/lib/dictionary'
import { Locale } from '@/lib/i18n.config'
import Link from "next/link";

export default async function MustSee({ lang }: { lang: Locale }) {
    const { page } = await getDictionary(lang)
    return (
        <div className={styles.mustSee}>
            <h2>{page.sights['must-see'].subtitle}</h2>
            <p>{page.sights['must-see'].description1}</p>
            <h3>{page.sights['must-see'].chuyregion}</h3>
            <p><Link href={`places/ala-archa-national-park`}><b>{page.sights['must-see'].alaarchatitle}</b></Link> {page.sights['must-see'].alaarchadescription}</p>
            <p><Link href={`places/burana-tower`}><b>{page.sights['must-see'].buranatitle}</b></Link> {page.sights['must-see'].buranadescription}</p>
            <h3>{page.sights['must-see'].issykulregion}</h3>
            <p><Link href={`places/ysyk-kol-lake`}><b>{page.sights['must-see'].lakeissykkultitle}</b></Link> {page.sights['must-see'].lakeissykkuldescription}</p>
            <p><Link href={`places/karakol-city`}><b>{page.sights['must-see'].karakoltitle}</b></Link> {page.sights['must-see'].karakoldescription}</p>
            <p><Link href={`places/jeti-oguz-canyons`}><b>{page.sights['must-see'].jetioguxtitle}</b></Link> {page.sights['must-see'].jetioguzdescription}</p>
            <h3>{page.sights['must-see'].narynregion}</h3>
            <p><Link href={`places/son-kol-lake`}><b>{page.sights['must-see'].sonkultitle}</b></Link> {page.sights['must-see'].sonkuldescription}</p>
            <p><Link href={`places/tash-rabat-caravanserai`}><b>{page.sights['must-see'].tashrabattitle}</b></Link> {page.sights['must-see'].tashrabatdescription}</p>
            <h3>{page.sights['must-see'].jalalabadregion}</h3>
            <p><Link href={`places/sary-chelek-biosphere-reserve`}><b>{page.sights['must-see'].sarychelextitle}</b></Link> {page.sights['must-see'].sarychelekdescription}</p>
            <p><Link href={`places/arslanbap-village`}><b>{page.sights['must-see'].arslanbobtitle}</b></Link> {page.sights['must-see'].arslanbobdescription}</p>
            <h3>{page.sights['must-see'].oshregion}</h3>
            <p><Link href={`places/sulaiman-too`}><b>{page.sights['must-see'].sulaymanmountaintitle}</b></Link> {page.sights['must-see'].sulaymanmountaindescription}</p>
            <p><Link href={`places/alay-valley`}><b>{page.sights['must-see'].alayvalleytitle}</b></Link> {page.sights['must-see'].alayvalleydescription}</p>
            <h3>{page.sights['must-see'].batkenregion}</h3>
            <p><Link href={`places/aigul-tash-mountain`}><b>{page.sights['must-see'].batkenvalleytitle}</b></Link> {page.sights['must-see'].batkenvalleydescription}</p>
            <p><Link href={`places/sarkent-national-park`}><b>{page.sights['must-see'].karakuljatitle}</b></Link> {page.sights['must-see'].karakuljadescription}</p>
            <h3>{page.sights['must-see'].talasregion}</h3>
            <p><Link href={`places/besh-tash-national-park`}><b>{page.sights['must-see'].beshtashtitle}</b></Link> {page.sights['must-see'].beshtashdescription}</p>
            <p><Link href={`places/manas-kumbozu-mausoleum`}><b>{page.sights['must-see'].manasordotitle}</b></Link> {page.sights['must-see'].manasordodescription}</p>
        </div>
    )
}