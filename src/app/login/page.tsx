import Link from 'next/link';
import styles from './login.module.css';
import LoginForm from '../admin/ui/loginForm/loginForm';
export default function LoginPage() { return <main className={styles.container}><div className={styles.wrap}><Link className={styles.brand} href="/en">GuideBook / admin</Link><LoginForm/><p className={styles.footer}>Authorized team members only. <Link href="/en">Back to the website</Link></p></div></main>; }
