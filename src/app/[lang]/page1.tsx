'use client'
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false; 
import styles from '../page.module.css'
import { useRouter } from "next/navigation";

export default function Home() {
    const langs = {
        "en": "en-US",
        "fr": "fr-FR",
        "de": "de-DE",
        "es": "es-ES",
        "ru": "ru-RU",
        "it": "it-IT",
        "jp": "ja-JP",
        "kr": "ko-KR",
        "ae": "ar-AE",
        "cn": "zh-CN"
    };
    const router = useRouter()
    // console.log(router)
    return (
        <div className={styles.mainDiv}>
            <h1>Home</h1>
        </div>
    )
}