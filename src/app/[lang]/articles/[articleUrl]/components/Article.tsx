import styles from '../page.module.css'
// import Link from "next/link";
import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
// import { getDictionary } from "@/lib/dictionary";
import Paragraph from './Paragraph'

import Image from "next/image";

type Props = {
  article: Article,
  lang: Locale,
}

export default async function Article({ article, lang }: Props) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const blurDataURL = article.image ? await getBase64(baseUrl + article.image) : ""
  // console.log(article.keywords)
  return (
    <article className={styles.article}>
        <div className={styles.hero}>
          
            {article.image && (
              <picture className={styles.image}>
                <Image
                src={baseUrl + article.image} 
                alt={article.title}
                sizes="(min-width: 800px) 546px, (min-width: 760px) calc(-795vw + 6752px), (min-width: 620px) 526px, calc(92vw - 26px)"
                // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                fill 
                placeholder="blur" blurDataURL={blurDataURL} 
                // priority
                // loading='lazy'
                />
              </picture>
            )}
          
            
            <h1>{article.title}</h1>
            <h3>{article.subtitle}</h3>
            <br />
        </div>
        {article.paragraphs.map((paragraph, index) => (
          <Paragraph key={index} paragraph={paragraph} lang={lang}/>
        ))}
      </article>
  )
}