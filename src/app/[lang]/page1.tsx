'use client'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; 
import styles from '../page.module.css'
import { useRouter } from "next/navigation";

export default function Home() {
    const router = useRouter()
    console.log(router)
    return (
        <div className={styles.mainDiv}>
            <h1>Home</h1>
        </div>
    )
}