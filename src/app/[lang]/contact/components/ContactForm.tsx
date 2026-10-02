'use client'
import ArrowIcon from '@/components/ArrowIcon';

import type { FormEvent } from 'react'
import type { Locale } from '@/lib/i18n.config'
import { contactCopy } from '../content'
import styles from './contact-dialog.module.css'

export default function ContactForm({ lang, email }: { lang: Locale; email: string }) {
  const copy = contactCopy[lang]
  const sendEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const fields = new FormData(event.currentTarget)
    const body = `${fields.get('message')}\n\n${copy.name}: ${fields.get('name')}\n${copy.email}: ${fields.get('email')}\n${copy.phone}: ${fields.get('phone') || '—'}`
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(String(fields.get('subject') || copy.message))}&body=${encodeURIComponent(body)}`
  }
  return (
    <form className={styles.form} onSubmit={sendEmail}>
      <div className={styles.fields}>
        <label>{copy.name}<input name="name" autoComplete="name" required maxLength={120}/></label>
        <label>{copy.email}<input name="email" type="email" autoComplete="email" required maxLength={254} dir="auto"/></label>
        <label>{copy.phone} <span>({copy.optional})</span><input name="phone" type="tel" autoComplete="tel" maxLength={40} dir="auto"/></label>
        <label>{copy.subject} <span>({copy.optional})</span><input name="subject" maxLength={160}/></label>
      </div>
      <label>{copy.message}<textarea name="message" rows={5} required maxLength={4000}/></label>
      <p className={styles.hint} id="contact-email-hint">{copy.hint}</p>
      <button type="submit" className={styles.submit} aria-describedby="contact-email-hint">{copy.send}<span aria-hidden="true"><ArrowIcon direction="up-right"/></span></button>
    </form>
  )
}
