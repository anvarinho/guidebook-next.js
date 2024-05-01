import Image from "next/image";

export default function Flag(lang: string){
    return (
        <Image
            src={`/${lang}.png`}
            alt={lang}
            // className={styles.flag}
            height={40}
            width={50}
            title={`Flag of ${lang}`}
        />
    )
}