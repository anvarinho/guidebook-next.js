// import Font Awesome CSS
import "@fortawesome/fontawesome-svg-core/styles.css"; 

import { config } from "@fortawesome/fontawesome-svg-core";
// Tell Font Awesome to skip adding the CSS automatically 
// since it's already imported above
config.autoAddCss = false; 

import Image from 'next/image'
import styles from './page.module.css'
import Navbar from '@/Components/Navbar1'

export default function Home() {
  return (
    <div className={styles.mainDiv}>
      <h1>Home</h1>
    </div>
  )
}
