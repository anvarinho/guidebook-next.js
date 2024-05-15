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
        window.onscroll = () =>{
            if (!showFlags){
                handleToggleNavbar()
                const navbarElement = document.querySelector(`.${styles.flaglist}`);
                if (navbarElement) {
                    navbarElement.classList.remove(`${styles.active}`);
                }
            }
        }
      }, [showFlags]);

    return (
        <div className={styles.flags}>
            <div className={`${styles.flaglist} ${showFlags ? '' : styles.active}`}>
                {i18n.locales.map((locale, i) => (
                    locale != lang ? 
                        <Link key={i}
                            href={redirectedPathName(locale)}
                            onClick={() => {handleToggleNavbar; Cookies.set('lang', locale, { expires: 365 })}}
                        >
                            <div className={styles.flagtext}>
                                <Image
                                    src={`/${locale}.png`}
                                    alt={locale}
                                    className={styles.flag}
                                    height={40}
                                    width={50}
                                />
                                {/* <p>{locale}</p> */}
                            </div>
                            
                        </Link> : <a key={i}></a>
                ))}
            </div>
            <button onClick={handleToggleNavbar}>
                <div className={styles.flagtext}>
                    <Image
                        src={`/${lang}.png`}
                        alt={lang}
                        className={styles.flag}
                        height={40}
                        width={50}
                    />
                    {/* <p>{lang}</p> */}
                </div>
            </button>
        </div>
    );
}