import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import Team from './components/team'
import Clients from './components/clients'


export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const { page } = await getDictionary(lang)
  return (
    <div>
      <div className={styles.about}>
        <h1 className={styles.heading} data-aos="zoom-out">{page.about.title}</h1>
        <div className={styles.details} >
              <div className={styles.box}>
                <h3>{page.about.subtitle}</h3>
                <p>{page.about.description}</p>
                <div>
                <a href="#team" className={styles.floatingButton}>{page.about.buttons.our_team}</a>
                <a href="#clients" className={styles.floatingButton}>{page.about.buttons.our_clients}</a>
                </div>
              </div>
          </div>
      </div>
      <Clients params={{lang}}/>
      <Team params={{lang}}/>
    </div>
    
  )
}

export async function generateMetadata({
  params: {lang}
}: {
  params: {lang : Locale}
}): Promise<Metadata> {
  const { page } = await getDictionary(lang)
  return {
      title: page.about.title,
      description: page.about.description,
      keywords: page.about.keywords,
  }
}