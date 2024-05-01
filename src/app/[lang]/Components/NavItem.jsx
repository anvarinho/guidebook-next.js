'use client'
import styles from './page.module.css'
import { usePathname } from 'next/navigation'
import Link from "next/link";

const NavItem = ({lang, index, url, text }) => {
    
    const currentPathname = usePathname();
    const pathname = (currentPathname === `/${lang}`) ? '/' : currentPathname.replace(`/${lang}`, '');

    return (
        <Link key={index} href={`/${lang}${url}`} className={(pathname === url) ? styles.active : ""}>
            {text}
        </Link>
    );
};

export default NavItem;
