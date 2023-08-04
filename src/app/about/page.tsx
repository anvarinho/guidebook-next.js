import { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'About Page',
  description: 'Created by Anvar Jumabaev',
}

export default function Home() {
  return (
    <>
      <div className={styles.main}>
        <h1>About</h1>
      </div>
    </>
  )
}