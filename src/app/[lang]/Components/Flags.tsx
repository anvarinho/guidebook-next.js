"use client";
import { isRtlLocale, localeMetadata } from '@/lib/localeMetadata';
import commonCopy from '@/translations/ui/common.json';
import additionalCopy from '@/translations/ui/app-lang-Components-Flags-tsx-copy.json';


import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import { type Locale, i18n } from "@/lib/i18n.config";
import { flagAssets } from "@/lib/flagAssets";
import styles from "./language-switcher.module.css";

const languages = localeMetadata;
const languageCodes = i18n.locales;

const copy: Record<Locale, { title: string; search: string; close: string; empty: string }> = {
    ...additionalCopy as Record<Locale, { title: string; search: string; close: string; empty: string }>,
    en: { title: "Choose your language", search: "Search languages", close: "Close", empty: "No languages found. Try another name or code." },
    it: { title: "Scegli la tua lingua", search: "Cerca una lingua", close: "Chiudi", empty: "Nessuna lingua trovata. Prova un altro nome o codice." },
    fr: { title: "Choisissez votre langue", search: "Rechercher une langue", close: "Fermer", empty: "Aucune langue trouvée. Essayez un autre nom ou code." },
    de: { title: "Sprache auswählen", search: "Sprachen suchen", close: "Schließen", empty: "Keine Sprache gefunden. Versuchen Sie einen anderen Namen oder Code." },
    es: { title: "Elige tu idioma", search: "Buscar idiomas", close: "Cerrar", empty: "No se encontraron idiomas. Prueba otro nombre o código." },
    jp: { title: "言語を選択", search: "言語を検索", close: "閉じる", empty: "言語が見つかりません。別の名前やコードをお試しください。" },
    kr: { title: "언어 선택", search: "언어 검색", close: "닫기", empty: "언어를 찾을 수 없습니다. 다른 이름이나 코드를 입력해 보세요." },
    ae: { title: "اختر لغتك", search: "البحث عن لغة", close: "إغلاق", empty: "لم يتم العثور على لغات. جرّب اسمًا أو رمزًا آخر." },
    cn: { title: "选择语言", search: "搜索语言", close: "关闭", empty: "未找到语言。请尝试其他名称或代码。" },
    ru: { title: "Выберите язык", search: "Поиск языка", close: "Закрыть", empty: "Язык не найден. Попробуйте другое название или код." },
};

const normalize = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export default function Flags({ lang }: { lang: Locale }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [urlSuffix, setUrlSuffix] = useState("");
    const pathname = usePathname();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const text = copy[lang];
    const search = normalize(query.trim());
    const exactCode = languageCodes.find(locale => search === locale || search === normalize(languages[locale].tag));
    const filtered = exactCode ? [exactCode] : languageCodes.filter(locale => {
        const { name, nativeName, tag } = languages[locale];
        return normalize(`${name} ${nativeName} ${locale} ${tag}`).includes(search);
    });

    useEffect(() => { setOpen(false); }, [pathname]);

    useEffect(() => {
        if (!open) return;
        const dialog = dialogRef.current;
        if (!dialog) return;
        const trigger = triggerRef.current;
        const rootOverflow = document.documentElement.style.overflow;
        const bodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        dialog.showModal();
        searchRef.current?.focus({ preventScroll: true });
        return () => {
            dialog.close();
            document.documentElement.style.overflow = rootOverflow;
            document.body.style.overflow = bodyOverflow;
            if (trigger?.isConnected) trigger.focus({ preventScroll: true });
        };
    }, [open]);

    const redirectedPathname = (locale: Locale) => {
        const segments = pathname.split("/");
        segments[1] = locale;
        return segments.join("/") + urlSuffix;
    };

    return (
        <div className={styles.flags} data-language-switcher>
            <button ref={triggerRef} type="button" className={styles.trigger}
                aria-label={commonCopy[lang].languageMenu} aria-haspopup="dialog"
                aria-expanded={open} aria-controls="site-languages"
                onClick={() => {
                    setQuery("");
                    setUrlSuffix(window.location.search + window.location.hash);
                    setOpen(true);
                }}>
                <Image className={styles.flagIcon} src={flagAssets[lang]} alt={languages[lang].nativeName} width={40} height={40} />
            </button>
            <dialog ref={dialogRef} id="site-languages" className={styles.popup}
                dir={isRtlLocale(lang) ? "rtl" : "ltr"}
                aria-labelledby="site-languages-title"
                onCancel={event => { event.preventDefault(); setOpen(false); }}
                onKeyDown={event => {
                    if (event.key !== "Tab") return;
                    const targets = event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled]), input, a[href]");
                    const first = targets[0];
                    const last = targets[targets.length - 1];
                    if (event.shiftKey && document.activeElement === first) {
                        event.preventDefault();
                        last?.focus();
                    } else if (!event.shiftKey && document.activeElement === last) {
                        event.preventDefault();
                        first?.focus();
                    }
                }}
                onClick={event => {
                    if (event.target !== event.currentTarget) return;
                    const bounds = event.currentTarget.getBoundingClientRect();
                    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setOpen(false);
                }}>
                <div className={styles.content}>
                    <div className={styles.heading}>
                        <h2 id="site-languages-title">{text.title}</h2>
                        <button type="button" className={styles.close} aria-label={text.close} onClick={() => setOpen(false)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
                        </button>
                    </div>
                    <div className={styles.search}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
                        <input ref={searchRef} type="search" value={query} aria-label={text.search}
                            placeholder={text.search} autoComplete="off" spellCheck={false}
                            aria-controls="site-language-results"
                            onChange={event => { setQuery(event.target.value); listRef.current?.scrollTo({ top: 0 }); }}
                            onKeyDown={event => {
                                if (event.key === "ArrowDown") {
                                    event.preventDefault();
                                    listRef.current?.querySelector("a")?.focus();
                                }
                            }} />
                    </div>
                    <ul ref={listRef} id="site-language-results" className={styles.list}>
                        {filtered.map(locale => {
                            const language = languages[locale];
                            const current = locale === lang;
                            const content = <>
                                <Image className={styles.flagIcon} src={flagAssets[locale]} alt="" width={40} height={40} />
                                <span className={styles.names}>
                                    <span lang={language.tag} dir="auto" className={styles.nativeName}>{language.nativeName}</span>
                                    <span className={styles.englishName}>{language.name}</span>
                                </span>
                                {current && <svg className={styles.check} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m5 12 4 4L19 6" /></svg>}
                            </>;
                            return (
                                <li key={locale}>
                                    <Link href={redirectedPathname(locale)} hrefLang={language.tag} prefetch={false}
                                        className={styles.language} aria-current={current ? "true" : undefined}
                                        onClick={event => {
                                            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                                            Cookies.set("lang", locale, { expires: 365, path: "/", sameSite: "lax", secure: window.location.protocol === "https:" });
                                            setOpen(false);
                                        }}>
                                        {content}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <p className={styles.status} role="status">{filtered.length === 0 ? text.empty : ""}</p>
                </div>
            </dialog>
        </div>
    );
}
