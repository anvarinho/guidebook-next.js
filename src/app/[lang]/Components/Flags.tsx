"use client";
import dynamic from "next/dynamic";
import Image, { type StaticImageData } from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n.config";
import styles from "./language-switcher.module.css";

// The dialog (55 flags, locale list, search) loads on first use, not with every page.
const loadDialog = () => import("./LanguageDialog");
const LanguageDialog = dynamic(loadDialog, { ssr: false });

export default function Flags({ lang, flag, label, nativeName }: {
    lang: Locale; flag: StaticImageData; label: string; nativeName: string;
}) {
    const [open, setOpen] = useState(false);
    const [urlSuffix, setUrlSuffix] = useState("");
    const pathname = usePathname();
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => { setOpen(false); }, [pathname]);

    return (
        <div className={styles.flags} data-language-switcher>
            <button ref={triggerRef} type="button" className={styles.trigger} data-track="lang"
                aria-label={label} aria-haspopup="dialog"
                aria-expanded={open} aria-controls={open ? "site-languages" : undefined}
                onPointerEnter={() => { void loadDialog(); }}
                onFocus={() => { void loadDialog(); }}
                onClick={() => {
                    setUrlSuffix(window.location.search + window.location.hash);
                    setOpen(true);
                }}>
                <Image className={styles.flagIcon} src={flag} alt={nativeName} width={40} height={40} />
            </button>
            {open && <LanguageDialog lang={lang} urlSuffix={urlSuffix} triggerRef={triggerRef} onClose={() => setOpen(false)} />}
        </div>
    );
}
