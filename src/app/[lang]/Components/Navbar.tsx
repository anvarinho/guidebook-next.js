import styles from './page.module.css'
import MenuButton from "./MenuButton";
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'

export default async function Navbar ({ lang }: { lang: Locale }) {
    const { page } = await getDictionary(lang)
    return (
        <header className={styles.header}>
            <section className={styles.flex}>
                <a href={`/${lang}`} className={styles.logo}>{page.name}</a>
                <nav className={`${styles.navbar}`}>
                    {page.navigation.map((link, index) => (
                        <a key={index} className='/' href={`/${lang}${link.url}`}>
                            {link.text}
                        </a>
                    ))}
                </nav>
                <MenuButton/>
            </section>
        </header>
    );
};
