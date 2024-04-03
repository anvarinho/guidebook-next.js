import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import Team from './components/team'


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
                <h3>Who we are?</h3>
                <p>{page.about.description}</p>
                <div>
                <a href="#team" className={styles.floatingButton}>Our Team</a>
                {/* <a href="{% url 'contact' %}" className={styles.floatingButton}>contact us</a> */}
                <a href="{% url 'contact' %}" className={styles.floatingButton}>Contact Us</a>
                </div>
              </div>
          </div>
      </div>
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