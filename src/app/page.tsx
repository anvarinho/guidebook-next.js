// import Font Awesome CSS
import "@fortawesome/fontawesome-svg-core/styles.css"; 

import { config } from "@fortawesome/fontawesome-svg-core";
import getWeatherData from "@/lib/getWeatherData";
import getWikiResults from "@/lib/getWikiResults";
// Tell Font Awesome to skip adding the CSS automatically 
// since it's already imported above
config.autoAddCss = false; 

import Image from 'next/image'
import styles from './page.module.css'

export default async function Home() {
  const wikiData = getWeatherData("Osh")
  const data = await wikiData
  console.log(data)
  return (
    <div className={styles.mainDiv}>
      <h1>Home</h1>
    </div>
  )
}
