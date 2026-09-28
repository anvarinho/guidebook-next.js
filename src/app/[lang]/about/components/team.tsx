import styles from './team.module.css'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import Link from 'next/link'
import Image from 'next/image'
import { PlacesReveal } from '../../places/components/PlacesMotion'


export default async function Team({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const { page } = await getDictionary(lang)
  return (
    <section className={styles.team} id='team' aria-labelledby="team-heading">
      <PlacesReveal><p className={styles.eyebrow}>02 / {page.about.subtitle}</p><h2 id="team-heading">{page.about.buttons.our_team}</h2></PlacesReveal>
      <div className={styles.team__container}>
        <PlacesReveal className={styles.team__member}>
            <div className={styles.team__member_image}>
                <Image src="/team/tm1.jpg" alt="Erkin" width={640} height={800} sizes="(max-width: 991px) 45vw, 23vw" />
            </div>
            <div className={styles.team__member_info}>
                <h3>Erkin</h3>
                {/* <p>Expert</p> */}
            </div>
        </PlacesReveal>
        <PlacesReveal className={styles.team__member} order={1}>
            <div className={styles.team__member_image}>
                <Image src="/team/tm2.jpg" alt="Evgeniy" width={640} height={800} sizes="(max-width: 991px) 45vw, 23vw" />
            </div>
            <div className={styles.team__member_info}>
                <h3>Evgeniy</h3>
                {/* <p>Expert</p> */}
            </div>
        </PlacesReveal>
        <PlacesReveal className={styles.team__member} order={2}>
            <div className={styles.team__member_image}>
                <Image src="/team/tm3.jpg" alt="Narynbek" width={640} height={800} sizes="(max-width: 991px) 45vw, 23vw" />
            </div>
            <div className={styles.team__member_info}>
                <h3>Narynbek</h3>
                {/* <p>Expert</p> */}
            </div>
        </PlacesReveal>
        <PlacesReveal className={styles.team__member} order={3}>
            <div className={styles.team__member_image}>
                <Image src="/team/tm4.jpg" alt="Anvar" width={640} height={800} sizes="(max-width: 991px) 45vw, 23vw" />
            </div>
            <div className={styles.team__member_info}>
                <h3>Anvar</h3>
                {/* <p>Expert</p> */}
            </div>
        </PlacesReveal>
      </div>
        <div>
            <Link href={`/${lang}/contact`} className={styles.floatingButton}>{page.about.buttons.contact_us}</Link>
            {/* <a href="{% url 'contact' %}" className={styles.floatingButton}>contact us</a> */}
            <Link href="#clients" className={styles.floatingButton}>{page.about.buttons.our_clients}</Link>
        </div>
    </section>
  )
}
