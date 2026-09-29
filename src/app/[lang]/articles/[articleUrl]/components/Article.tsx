import styles from '../page.module.css'
// import Link from "next/link";
import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
// import { getDictionary } from "@/lib/dictionary";
import Paragraph from './Paragraph'
import { getDictionary } from '@/lib/dictionary'

import Image from "next/image";
import { PlacesReveal } from '../../../places/components/PlacesMotion';

type Props = {
  article: Article,
  lang: Locale,
}

export default async function Article({ article, lang }: Props) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const blurDataURL = article.image ? await getBase64(baseUrl + article.image) : ""
  const createdAtDate = new Date(article.createdAt);
  const dayOfMonth = createdAtDate.toLocaleString();
  const { page } = await getDictionary(lang)
  return (
    <article className={styles.article}>
        {article.image && (
          <PlacesReveal className={styles.heroImage}>
              <picture className={styles.image}>
                <Image
                src={baseUrl + article.image} 
                alt={article.title}
                sizes="(min-width: 800px) 546px, (min-width: 760px) calc(-795vw + 6752px), (min-width: 620px) 526px, calc(92vw - 26px)"
                // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill 
                placeholder="blur" blurDataURL={blurDataURL} 
                priority
                />
              </picture>
          </PlacesReveal>
        )}
        <div className={styles.articleLayout}>
          <div className={styles.body}>
            {article.paragraphs.map((paragraph, index) => (
              <Paragraph key={index} paragraph={paragraph} lang={lang} priority={index === 0 && !article.image}/>
            ))}
          </div>
          <aside className={styles.aside}>
            <PlacesReveal className={styles.asideInner}>
              <p className={styles.asideLabel}>{page.articles.name}</p>
              <p className={styles.asideText}>{article.title}</p>
              <a href="#article-end" className={styles.asideLink}>↓ <span>{page.info.seen}{article.viewCount}</span></a>
            </PlacesReveal>
          </aside>
        </div>
        <div id="article-end" className={styles.info}>
          <time dateTime={article.createdAt.toLocaleString()}>{page.info.created}{dayOfMonth}</time>
          <span>{page.info.seen}{new Intl.NumberFormat(page.langCode).format(article.viewCount)}</span>
        </div>
      </article>
  )
}
