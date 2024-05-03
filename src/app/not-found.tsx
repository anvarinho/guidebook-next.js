"use client"
import styles from './[lang]/page.module.css'
import { useRouter } from "next/navigation"
import Link from 'next/link';

export default function Custom404() {
    const router = useRouter()
    return <div className={styles.notfound}>
                <h1>404 - Ooops!!!! Page Not Found!</h1>
                <div className={styles.buttons}>
                    <Link href="/places" className={styles.floatingButton}>Places</Link>
                    <Link href={`/articles`} className={styles.floatingButton}>Articles</Link>
                    <Link href={`/tours`} className={styles.floatingButton}>Tours</Link>
                    <Link href="" className={styles.floatingButton} onClick={() => router.back()}>Back</Link>
                </div>
            </div>
}