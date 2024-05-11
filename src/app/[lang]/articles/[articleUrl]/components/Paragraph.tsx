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
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
    const blurDataURL = paragraph.image ? await getBase64(baseUrl + paragraph.image) : ""
    return (
        <div className={styles.hero}>
                {paragraph.image && (
                    <picture className={styles.image}>
                        <Image
                        src={baseUrl + paragraph.image}
                        alt={paragraph.title}
                        fill
                        sizes="(min-width: 800px) 546px, (min-width: 760px) calc(-795vw + 6752px), (min-width: 620px) 526px, calc(92vw - 26px)"
                        placeholder="blur" blurDataURL={blurDataURL}
                        // loading='lazy'
                         />
                    </picture>
                )}
            
            
            {paragraph.link ? (
            <Link href={`${baseUrl}${lang}/${paragraph.link}`} target='_blank'>
                <h2>{paragraph.title}</h2>
            </Link>
            ): <h2>{paragraph.title}</h2>}
            <p>{paragraph.text}</p>
            <br />
        </div>
    )
} 