'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { Locale } from '@/lib/i18n.config'
import ContactForm from './ContactForm'
import { contactCopy } from '../content'
import styles from './contact-dialog.module.css'

export default function ContactDialog({ lang, title, phone, email, address }: { lang: Locale; title: string; phone: string; email: string; address: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const direct = pathname.replace(/\/$/, '') === `/${lang}/contact`
  const copy = contactCopy[lang]
  const close = useCallback(() => {
    setOpen(false)
    if (direct) router.replace(`/${lang}`)
  }, [direct, lang, router])

  useEffect(() => { setOpen(direct) }, [direct, pathname])

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element).closest?.('a')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname.replace(/\/$/, '') !== `/${lang}/contact`) return
      event.preventDefault()
      triggerRef.current = anchor
      setOpen(true)
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [lang])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open) return
    const previousOverflow = document.documentElement.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    return () => {
      dialog.close()
      document.documentElement.style.overflow = previousOverflow
      document.body.style.overflow = previousBodyOverflow
      if (triggerRef.current?.isConnected) {
        const trigger = triggerRef.current
        const returnTarget = getComputedStyle(trigger).visibility === 'hidden'
          ? trigger.closest('header')?.querySelector<HTMLButtonElement>('button[aria-controls="site-navigation"]')
          : trigger
        returnTarget?.focus({ preventScroll: true })
      }
      triggerRef.current = null
    }
  }, [open])

  return (
    <dialog ref={dialogRef} className={styles.dialog} dir={lang === 'ae' ? 'rtl' : 'ltr'} aria-labelledby="contact-dialog-title" aria-describedby="contact-dialog-intro" onCancel={event => { event.preventDefault(); close() }} onClick={event => {
      if (event.target !== event.currentTarget) return
      const bounds = event.currentTarget.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close()
    }}>
      <button type="button" className={styles.close} onClick={close} aria-label={copy.close} autoFocus><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg></button>
      <div className={styles.layout}>
        <div className={styles.intro}>
          <span className={styles.emblem} aria-hidden="true"/>
          <h2 id="contact-dialog-title">{title}</h2>
          <p id="contact-dialog-intro">{copy.intro}</p>
          <div className={styles.directLinks}>
            <a href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"><span>WhatsApp</span><span aria-hidden="true">↗</span></a>
            <a href={`tel:${phone.replace(/[^+\d]/g, '')}`}><bdi>{phone}</bdi><span aria-hidden="true">↗</span></a>
            <a href={`mailto:${email}`}><bdi>{email}</bdi><span aria-hidden="true">↗</span></a>
          </div>
          <p className={styles.address}>{address}</p>
        </div>
        <ContactForm lang={lang} email={email}/>
      </div>
    </dialog>
  )
}
