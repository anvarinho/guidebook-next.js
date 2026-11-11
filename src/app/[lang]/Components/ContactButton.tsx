"use client";
import reviewedLabels from '@/translations/ui/reviewed-labels.json';

import additionalContactMe from '@/translations/ui/app-lang-Components-ContactButton-tsx-contactMe.json';

import React, { useState, useEffect } from "react";
import styles from "./controls.module.css";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Locale } from "@/lib/i18n.config";
import Image from "next/image";
import { onScrollFrame } from "./motion/scroll";

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
    // Show the button once the visitor has scrolled past the top of the page.
    return onScrollFrame(scrollY => setIsScrolled(scrollY > 100));
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
