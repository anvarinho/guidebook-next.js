import styles from './team.module.css'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import Link from 'next/link'
import BlurImage from '@/components/BlurImage';
import erkin from '../../../../../public/team/tm1.jpg'
import evgeniy from '../../../../../public/team/tm2.jpg'
import narynbek from '../../../../../public/team/tm3.jpg'
import anvar from '../../../../../public/team/tm4.jpg'

const members = [
  { name: 'Erkin', photo: erkin },
  { name: 'Evgeniy', photo: evgeniy },
  { name: 'Narynbek', photo: narynbek },
  { name: 'Anvar', photo: anvar },
]

export default async function Team({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
  const { page } = await getDictionary(lang)
  return (
    <section className={styles.team} id='team' aria-labelledby="team-heading">
      <div data-reveal><p className={styles.eyebrow}>02 / {page.about.subtitle}</p><h2 id="team-heading">{page.about.buttons.our_team}</h2></div>
      <div className={styles.team__container}>
        {members.map(member => <div className={styles.team__member} key={member.name} data-reveal="scale">
          <div className={styles.team__member_image}>
            <BlurImage src={member.photo} alt={member.name} placeholder="blur" sizes="(max-width: 991px) 45vw, 23vw"/>
          </div>
          <div className={styles.team__member_info}><h3>{member.name}</h3></div>
        </div>)}
      </div>
        <div data-reveal="fade">
            <Link href={`/${lang}/contact`} className={styles.floatingButton}>{page.about.buttons.contact_us}</Link>
            <Link href="#clients" className={styles.floatingButton}>{page.about.buttons.our_clients}</Link>
        </div>
    </section>
  )
}
