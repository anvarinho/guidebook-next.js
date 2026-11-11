import getBase64 from '@/lib/getLocalBase64';
import { imagePlaceholder } from '@/lib/imagePlaceholder';
import styles from '../page.module.css'
import BlurImage from '@/components/BlurImage';
import { Locale } from "@/lib/i18n.config";
import Link from "next/link";
import { renderContentHtml } from '@/lib/contentHtml.server';

type Props = {
    id: string,
    paragraph: Paragraph,
    lang: Locale,
    priority: boolean
}

export default function Article({ id, paragraph, lang, priority}: Props) {
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
    const html = renderContentHtml(paragraph.text, {
        lang,
        classes: { link: styles.contentLink, table: styles.contentTable, tableScroll: styles.tableScroll, markdownImage: styles.contentImage },
    });
    return (
        <div id={id} className={styles.paragraph} data-reveal>
                {paragraph.image && (
                    <picture className={styles.image}>
                        <BlurImage
                {...imagePlaceholder(getBase64(paragraph.image))}
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
            {paragraph.title && (paragraph.link ? (
            <Link href={`${baseUrl}${lang}/${paragraph.link}`} target='_blank'>
                <h2>{paragraph.title}</h2>
            </Link>
            ): <h2>{paragraph.title}</h2>)}
            <div className={styles.richContent} dangerouslySetInnerHTML={{ __html: html }} />
            </div>
        </div>
    )
}
