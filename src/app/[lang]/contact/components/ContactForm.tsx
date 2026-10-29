'use client'
import ArrowIcon from '@/components/ArrowIcon';

import { useId, useRef, useState, type FormEvent } from 'react'
import { sendContact, type SubmissionResult } from '@/lib/contact/client'
import type { Locale } from '@/lib/i18n.config'
import { contactCopy } from '../content'
import styles from './contact-dialog.module.css'

export default function ContactForm({ lang }: { lang: Locale }) {
  const copy = contactCopy[lang]
  const id = useId()
  const sending = useRef(false)
  const [state, setState] = useState<'idle' | 'pending' | SubmissionResult>('idle')
  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (sending.current) return
    const form = event.currentTarget
    sending.current = true
    setState('pending')
    const result = await sendContact(new FormData(form), lang)
    if (result === 'success') form.reset()
    setState(result)
    sending.current = false
  }
  return (
    <form className={styles.form} onSubmit={sendMessage}>
      <div hidden aria-hidden="true"><label>Website<input readOnly={state === 'pending'} name="website" tabIndex={-1} autoComplete="off" maxLength={200}/></label></div>
      <div className={styles.fields}>
        <label>{copy.name}<input readOnly={state === 'pending'} name="name" autoComplete="name" required maxLength={120}/></label>
        <label>{copy.email}<input readOnly={state === 'pending'} name="email" type="email" autoComplete="email" required maxLength={254} dir="auto"/></label>
        <label>{copy.phone} <span>({copy.optional})</span><input readOnly={state === 'pending'} name="phone" type="tel" autoComplete="tel" maxLength={40} dir="auto"/></label>
        <label>{copy.subject} <span>({copy.optional})</span><input readOnly={state === 'pending'} name="subject" maxLength={160}/></label>
      </div>
      <label>{copy.message}<textarea readOnly={state === 'pending'} name="message" rows={5} required maxLength={4000}/></label>
      <p className={styles.hint} id={`${id}-hint`}>{copy.hint}</p>
      <p id={`${id}-status`} role="status" aria-live="polite" aria-atomic="true">{state === 'idle' ? '' : copy[state]}</p>
      <button type="submit" disabled={state === 'pending'} aria-busy={state === 'pending'} className={styles.submit} aria-describedby={`${id}-hint ${id}-status`}>{state === 'pending' ? copy.pending : copy.send}<span aria-hidden="true"><ArrowIcon direction="up-right"/></span></button>
    </form>
  )
}
