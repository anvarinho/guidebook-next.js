"use client";
import reviewedLabels from '@/translations/ui/reviewed-labels.json';

import additionalContactMe from '@/translations/ui/app-lang-Components-ContactButton-tsx-contactMe.json';

import React, { useState, useEffect } from "react";
import styles from "./controls.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Locale } from "@/lib/i18n.config";
import { sendAnalyticsEvent } from "@/lib/analytics";
import Image from "next/image";

const ContactButton: React.FC<{ lang: Locale }> = ({ lang }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isManas = pathname.split("/")[2] === "manas";
  const contactMe = {
    ...additionalContactMe,
    en: "Any Questions?",
    es: "¿Alguna pregunta?",
    fr: "Des questions ?",
    de: "Noch Fragen?",
    it: "Domande?",
    ru: "Связаться?",
    kr: "질문이 있으신가요?",
    cn: "有问题吗？",
    jp: "質問はありますか？",
    ae: "هل لديك أي أسئلة؟",
  };

  useEffect(() => {
    if (isManas) return;
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
    window.addEventListener("scroll", handleScroll);

    // Clean up the scroll event listener when the component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isManas]);

  if (isManas) return null;

  return (
    <div className={`${styles.contactBtn} ${isScrolled ? "" : styles.active}`}>
      <div className={styles.contactBox}>
        {pathname.includes("/tours/") ? (
          <h4>{reviewedLabels[lang].book}</h4>
        ) : (
          <h4>{contactMe[lang]}</h4>
        )}
        {pathname.includes("/tours/") ? (
          <Link
            href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}?text=${encodeURIComponent(`https://central-asia.live${pathname} ${reviewedLabels[lang].book}`)}`}
            title={`WhatsApp · ${reviewedLabels[lang].book}`}
            target="_blank"
            onClick={() =>
              sendAnalyticsEvent({
                event: "buttonClicked",
                value: "4FJFCJuVic8YELL_7YUq",
              })
            }
          >
            {/* <FontAwesomeIcon className={styles.phoneIcon} icon={faPhone} /> */}
            <Image src={"/whatsapp.png"} width={50} height={50} alt="" />
          </Link>
        ) : (
          <Link
            href={`https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}`}
            title={`WhatsApp · ${contactMe[lang]}`}
            target="_blank"
          >
            {/* <FontAwesomeIcon className={styles.phoneIcon} icon={faPhone} /> */}
            <Image src={"/whatsapp.png"} width={50} height={50} alt="" />
          </Link>
        )}
      </div>
    </div>
  );
};

export default ContactButton;
