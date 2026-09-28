'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Locale } from '@/lib/i18n.config'
import MenuButton from './MenuButton'
import styles from './navbar.module.css'

const labels: Record<Locale, { open: string; close: string; navigation: string }> = {
  en: { open: 'Open menu', close: 'Close menu', navigation: 'Main navigation' },
  fr: { open: 'Ouvrir le menu', close: 'Fermer le menu', navigation: 'Navigation principale' },
  de: { open: 'Menü öffnen', close: 'Menü schließen', navigation: 'Hauptnavigation' },
  es: { open: 'Abrir menú', close: 'Cerrar menú', navigation: 'Navegación principal' },
  it: { open: 'Apri menu', close: 'Chiudi menu', navigation: 'Navigazione principale' },
  ru: { open: 'Открыть меню', close: 'Закрыть меню', navigation: 'Основная навигация' },
  ae: { open: 'فتح القائمة', close: 'إغلاق القائمة', navigation: 'التنقل الرئيسي' },
  cn: { open: '打开菜单', close: '关闭菜单', navigation: '主导航' },
  jp: { open: 'メニューを開く', close: 'メニューを閉じる', navigation: 'メインナビゲーション' },
  kr: { open: '메뉴 열기', close: '메뉴 닫기', navigation: '주 메뉴' },
}

export default function Navigation({ lang, name, links, contactLabel }: {
  lang: Locale; name: string; links: { text: string; url: string }[]; contactLabel: string
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const copy = labels[lang]
  const currentPath = (pathname.replace(`/${lang}`, '') || '/').replace(/\/$/, '') || '/'

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    let previousY = Math.max(0, window.scrollY)
    let frame = 0
    setScrolled(previousY > 24)
    setHidden(false)
    const update = () => {
      const y = Math.max(0, window.scrollY)
      setScrolled(y > 24)
      if (y < 90) setHidden(false)
      else if (Math.abs(y - previousY) > 6) setHidden(y > previousY)
      if (Math.abs(y - previousY) > 6 || y < 90) previousY = y
      frame = 0
    }
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame) }
  }, [pathname])

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 992px)')
    const onResize = () => { if (desktop.matches) setOpen(false) }
    desktop.addEventListener('change', onResize)
    return () => desktop.removeEventListener('change', onResize)
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <header ref={headerRef} className={styles.header} data-scrolled={scrolled} data-hidden={hidden && !open} data-open={open} dir={lang === 'ae' ? 'rtl' : 'ltr'} onFocus={() => setHidden(false)} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false)
    }}>
      <div className={styles.bar}>
        <Link href={`/${lang}`} className={styles.brand} aria-label={name} onClick={() => setOpen(false)}>
          <span className={styles.emblem} aria-hidden="true">
            <Image className={styles.emblemRays} src="/intro/flag.png" alt="" width={32} height={32}/>
            <Image className={styles.emblemCenter} src="/intro/flag.png" alt="" width={32} height={32}/>
          </span>
          <span className={styles.brandName}>{name}</span>
        </Link>
        <MenuButton ref={buttonRef} open={open} label={open ? copy.close : copy.open} onClick={() => setOpen(value => !value)}/>
        <nav id="site-navigation" className={styles.navigation} data-open={open} aria-label={copy.navigation}>
          <ul className={styles.links}>
            {links.map(link => {
              const active = currentPath === link.url || (link.url !== '/' && currentPath.startsWith(`${link.url}/`))
              return <li key={link.url}><Link href={`/${lang}${link.url}`} className={styles.navLink} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}><span>{link.text}</span><span className={styles.mobileArrow} aria-hidden="true">↗</span></Link></li>
            })}
          </ul>
          <Link href={`/${lang}/contact`} className={styles.contact} aria-current={currentPath === '/contact' ? 'page' : undefined} onClick={() => setOpen(false)}>{contactLabel}<span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  )
}
