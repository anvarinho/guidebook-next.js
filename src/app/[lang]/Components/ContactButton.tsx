"use client";
import React, { useState, useEffect } from "react";
import styles from './page.module.css'
import { usePathname } from 'next/navigation'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { Locale } from "@/lib/i18n.config";
import { sendGAEvent } from '@next/third-parties/google'
import Image from "next/image";

const ContactButton: React.FC<{ lang: Locale }> = ({ lang }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname()
    const contactMe = {
        en: 'Any Questions?',
        es: '¿Alguna pregunta?',
        fr: 'Des questions ?',
        de: 'Noch Fragen?',
        it: 'Domande?',
        ru: 'Связаться?',
        kr: '질문이 있으신가요?',
        cn: '有问题吗？',
        jp: '質問はありますか？',
        ae: 'هل لديك أي أسئلة؟'
    }

    const bookTour = {
        en: 'Book a Tour !',
        es: 'Reservar Tour !',
        fr: 'Réserver une visite !',
        de: 'Tour Buchen !',
        it: 'Prenota un Tour !',
        ru: 'Забронировать тур !',
        kr: '투어 예약 !',
        cn: '预订旅游 !',
        jp: 'ツアーを予約する !',
        ae: '! حجز جولة',
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
                {pathname.includes('/tours/') ? (
                    <h4>{bookTour[lang]}</h4>
                ) : (
                    <h4>{contactMe[lang]}</h4>
                )}
                {
                    pathname.includes('/tours/') ? (
                        <Link href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}?text=https://central-asia.live${pathname}%20${bookTour[lang]}`} title="Whatsapp contact" target="_blank" onClick={() => sendGAEvent({ event: 'buttonClicked', value: '4FJFCJuVic8YELL_7YUq' })}>
                            {/* <FontAwesomeIcon className={styles.phoneIcon} icon={faPhone} /> */}
                            <Image src={"/whatsapp.png"} width={50} height={50} alt=""/>
                        </Link>
                    ) : (
                        <Link href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}?text=Hello!!!`} title="Whatsapp contact" target="_blank">
                            {/* <FontAwesomeIcon className={styles.phoneIcon} icon={faPhone} /> */}
                            <Image src={"/whatsapp.png"} width={50} height={50} alt=""/>
                        </Link>
                    )
                }
            </div>
        </div>
    );
};

export default ContactButton;