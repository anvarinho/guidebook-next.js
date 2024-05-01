import styles from '../page.module.css'
import MenuButton from "./MenuButton";
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import NavItem from './NavItem'

export default async function Test ({ lang }: { lang: Locale }) {
    const { page } = await getDictionary(lang)
    return (
        <header className={styles.header}>
            <section className={styles.flex}>
                <a href={`/${lang}`} className={styles.logo}>{page.name}</a>
                <nav className={`${styles.navbar}`}>
                    {page.navigation.map((link, index) => (
                        <NavItem key={index} lang={lang} index={index} url={link.url} text={link.text} />
                    ))}
                </nav>
                <MenuButton/>
            </section>
        </header>
    );
}