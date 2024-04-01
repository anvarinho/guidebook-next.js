import styles from '../page.module.css'
import Image from "next/image";
import { Locale } from "@/lib/i18n.config";
import Link from "next/link";
import getBase64 from "@/lib/getLocalBase64"

type Props = {
    paragraph: Paragraph,
    lang: Locale,
}

export default async function Article({ paragraph, lang}: Props) {
    const baseUrl = 'http://159.65.95.44/';
    // const baseUrl1 = 'http://127.0.0.1:3000/';
    const blurDataURL = paragraph.image ? await getBase64(baseUrl + paragraph.image) : ""
    return (
        <div className={styles.hero}>
            {paragraph.image && (
                <Image
                src={baseUrl + paragraph.image}
                alt={lang}
                // className={styles.flag}
                height={400}
                width={600}  placeholder="blur" blurDataURL={blurDataURL} priority/>
            )}
            {paragraph.link ? (
            <Link href={`${baseUrl}${lang}/${paragraph.link}`} target='_blank'>
                <h3>{paragraph.title}</h3>
            </Link>
            ): <h3>{paragraph.title}</h3>}
            <p>{paragraph.text}</p>
            <br />
        </div>
    )
} 