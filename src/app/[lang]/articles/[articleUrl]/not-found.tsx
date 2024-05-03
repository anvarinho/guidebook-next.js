"use client"
import styles from '../../places/[placeUrl]/page.module.css'
import { useRouter } from "next/navigation"
import Link from 'next/link';
import { Locale } from '@/lib/i18n.config'

export default function NotFound({ lang }: { lang: Locale }) {
    const router = useRouter()
    return <div className={styles.notfound}>
                <h1>404 - Ooops!!!! Article Not Found!</h1>
                <div className={styles.buttons}>
                    <Link href="#places" className={styles.floatingButton}>Places</Link>
                    <Link href={`/${lang}/articles`} className={styles.floatingButton}>Articles</Link>
                    <Link href={`/${lang}/tours`} className={styles.floatingButton}>Tours</Link>
                    <Link href="" className={styles.floatingButton} onClick={() => router.back()}>Back</Link>
                </div>
            </div>
}