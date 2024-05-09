import styles from './page.module.css'
import MenuButton from "./MenuButton";
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import NavItem from './NavItem'
import Link from 'next/link';

export default async function Navbar ({ lang }: { lang: Locale }) {
    const { page } = await getDictionary(lang)
    return (
        <header className={styles.header}>
            <div className={styles.flex}>
                <Link href={`/${lang}`} className={styles.logo}><h3>{page.name}</h3></Link>
                <nav className={`${styles.navbar}`}>
                    {page.navigation.map((link, index) => (
                        <NavItem key={index} lang={lang} index={index} url={link.url} text={link.text} />
                    ))}
                </nav>
                <MenuButton/>
            </div>
        </header>
    );
}
