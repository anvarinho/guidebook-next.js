"use client"
import Link from "next/link";
import styles from './page.module.css'
import Image from "next/image";
import { usePathname } from 'next/navigation'
import { Locale, i18n } from "@/lib/i18n.config";
import React, { useState, useEffect } from "react";
import Cookies from 'js-cookie'

export default function Flags({ lang }: { lang: Locale }) {
    const [showFlags, setShowFlags] = useState(true);
    const pathName = usePathname()

    const handleToggleNavbar = () => {
        setShowFlags((showFlags) => !showFlags);
    };

    const redirectedPathName = (locale: string) => {
        if (!pathName) return '/'
        const segments = pathName.split('/')
        segments[1] = locale
        return segments.join('/')
    }

    useEffect(() => {
        const closeMenu = () => setShowFlags(true);
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeMenu();
        };
        closeMenu();
        window.addEventListener('scroll', closeMenu, { passive: true });
        document.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('scroll', closeMenu);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [pathName]);

    return (
        <div className={styles.flags} data-language-switcher>
            <div id="site-languages" className={`${styles.flaglist} ${showFlags ? '' : styles.active}`}>
                {i18n.locales.map((locale, i) => (
                    locale != lang && 
                        <Link key={i}
                            href={redirectedPathName(locale)}
                            hrefLang={locale === 'ae' ? 'ar' : locale === 'jp' ? 'ja' : locale === 'kr' ? 'ko' : locale === 'cn' ? 'zh-CN' : locale}
                            onClick={() => {setShowFlags(true); Cookies.set('lang', locale, { expires: 365 })}}
                        >
                            <div className={styles.flagtext}>
                                <Image
                                    src={`/${locale}.png`}
                                    alt={locale}
                                    className={styles.flag}
                                    height={40}
                                    width={40}
                                />
                                {/* <p>{locale}</p> */}
                            </div>
                            
                        </Link>
                ))}
            </div>
            <button onClick={handleToggleNavbar} aria-label="Toggle language menu" aria-expanded={!showFlags} aria-controls="site-languages">
                <div className={styles.flagtext}>
                    <Image
                        src={`/${lang}.png`}
                        alt={lang}
                        className={styles.flag}
                        height={40}
                        width={40}
                    />
                    {/* <p>{lang}</p> */}
                </div>
            </button>
        </div>
    );
}
