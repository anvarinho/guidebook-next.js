import styles from './team.module.css'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'


export default async function Team({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const { page } = await getDictionary(lang)
  return (
    <section className={styles.team} id='team'>
      <h1>{page.about.buttons.our_team}</h1>
      <div className={styles.team__container}>
        <article className={styles.team__member} data-aos="zoom-in">
            <div className={styles.team__member_image}>
                <img src="/team/tm1.jpg" alt=""/>
            </div>
            <div className={styles.team__member_info}>
                <h4>Erkin</h4>
                {/* <p>Expert</p> */}
            </div>
        </article>
        <article className={styles.team__member} data-aos="zoom-in">
            <div className={styles.team__member_image}>
                <img src="/team/tm2.jpg" alt=""/>
            </div>
            <div className={styles.team__member_info}>
                <h4>Evgeniy</h4>
                {/* <p>Expert</p> */}
            </div>
        </article>
        <article className={styles.team__member} data-aos="zoom-in">
            <div className={styles.team__member_image}>
                <img src="/team/tm3.jpg" alt=""/>
            </div>
            <div className={styles.team__member_info}>
                <h4>Narynbek</h4>
                {/* <p>Expert</p> */}
            </div>
        </article>
        <article className={styles.team__member} data-aos="zoom-in">
            <div className={styles.team__member_image}>
                <img src="/team/tm4.jpg" alt=""/>
            </div>
            <div className={styles.team__member_info}>
                <h4>Anvar</h4>
                {/* <p>Expert</p> */}
            </div>
        </article>
      </div>
        <div>
            <a href="#contact" className={styles.floatingButton}>{page.about.buttons.contact_us}</a>
            {/* <a href="{% url 'contact' %}" className={styles.floatingButton}>contact us</a> */}
            <a href="#clients" className={styles.floatingButton}>{page.about.buttons.our_clients}</a>
        </div>
    </section>
  )
}