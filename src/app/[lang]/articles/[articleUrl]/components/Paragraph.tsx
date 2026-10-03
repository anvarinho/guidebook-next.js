import styles from '../page.module.css'
import Image from "next/image";
import { Locale } from "@/lib/i18n.config";
import Link from "next/link";
import { PlacesReveal } from '../../../places/components/PlacesMotion';

type Props = {
    paragraph: Paragraph,
    lang: Locale,
    priority: boolean
}

export default function Article({ paragraph, lang, priority}: Props) {
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
    return (
        <PlacesReveal className={styles.paragraph}>
                {paragraph.image && (
                    <picture className={styles.image}>
                        <Image
                        src={baseUrl + paragraph.image}
                        alt={paragraph.title}
                        fill
                        sizes="(min-width: 800px) 546px, (min-width: 760px) calc(-795vw + 6752px), (min-width: 620px) 526px, calc(92vw - 26px)"
                        priority={priority}
                        loading={priority ? 'eager' : 'lazy'}
                         />
                    </picture>
                )}
            
            
            <div className={styles.paragraphCopy}>
            {paragraph.link ? (
            <Link href={`${baseUrl}${lang}/${paragraph.link}`} target='_blank'>
                <h2>{paragraph.title}</h2>
            </Link>
            ): <h2>{paragraph.title}</h2>}
            <p>{paragraph.text}</p>
            </div>
        </PlacesReveal>
    )
}
