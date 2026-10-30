'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import styles from './loginForm.module.css';
export default function LoginForm() {
  const [visible,setVisible] = useState(false);
  const [pending,setPending] = useState(false);
  const [error,setError] = useState('');
  const router = useRouter();
  async function submit(event) {
    event.preventDefault(); if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true); setError('');
    try {
      const result = await signIn('credentials', { email:String(data.get('email')).trim().toLowerCase(), password:data.get('password'), redirect:false, callbackUrl:'/admin' });
      if (!result?.ok || result.error) { setError('Unable to sign in. Check your credentials or try again later.'); return; }
      router.replace('/admin'); router.refresh();
    } catch { setError('Unable to sign in. Check your credentials or try again later.'); }
    finally { setPending(false); }
  }
  return <form className={styles.form} onSubmit={submit} aria-busy={pending}><h1>Welcome back</h1><p className={styles.intro}>Sign in to manage your GuideBook.</p>{error && <div role="alert" className={styles.error}>{error}</div>}<label htmlFor="email">Email address<input id="email" type="email" name="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={254}/></label><label htmlFor="password">Password</label><span className={styles.password}><input id="password" type={visible?'text':'password'} name="password" autoComplete="current-password" required/><button type="button" className={styles.toggle} aria-controls="password" aria-pressed={visible} aria-label={visible?'Hide password':'Show password'} onClick={() => setVisible(!visible)}>{visible?'Hide':'Show'}</button></span><button className={styles.submit} type="submit" disabled={pending}>{pending?'Signing in…':'Sign in'}</button><p className={styles.help}>Forgot your password? Ask your server operator to reset your administrator password.</p></form>;
}
