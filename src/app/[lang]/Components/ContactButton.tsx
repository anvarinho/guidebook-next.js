"use client";
import React, { useState, useEffect } from "react";
import styles from './page.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Locale } from "@/lib/i18n.config";

import {
  faPhone
} from "@fortawesome/free-solid-svg-icons";

const ContactButton: React.FC<{ lang: Locale }> = ({ lang }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const texts = {
        en: 'Any Questions?',
        es: '¿Alguna pregunta?',
        fr: 'Des questions ?',
        de: 'Noch Fragen?',
        it: 'Domande?',
        ru: 'Есть вопросы?',
        kr: '질문이 있으신가요?',
        cn: '有问题吗？',
        jp: '質問はありますか？',
        ae: 'هل لديك أي أسئلة؟'
      }

    useEffect(() => {
        // Function to handle the scroll event
        const handleScroll = () => {
        const scrollY = window.scrollY;
        // Set a threshold value for when to toggle the class
        const scrollThreshold = 100;

        // Check if the user has scrolled beyond the threshold
        if (scrollY > scrollThreshold) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
        };

        // Add the scroll event listener when the component mounts
        window.addEventListener('scroll', handleScroll);

        // Clean up the scroll event listener when the component unmounts
        return () => {
        window.removeEventListener('scroll', handleScroll);
        };
    }, [isScrolled]);
    return (
        <div className={`${styles.contactBtn} ${isScrolled ? '' : styles.active}`}>
            <div className={styles.contactBox}>
                <h4>{texts[lang]}</h4>
                <Link href="https://wa.me/996500490806?text=Hello!!!" target="_blank">
                    <FontAwesomeIcon className={styles.phoneIcon} icon={faPhone} />
                </Link>
            </div>
        </div>
    );
};

export default ContactButton;