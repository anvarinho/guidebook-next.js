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
  const baseUrl1 = 'http://127.0.0.1:3000/';
  const blurDataURL = article.image ? await getBase64(baseUrl + article.image) : ""
  // console.log(article.keywords)
  return (
    <article className={styles.article}>
        <div className={styles.hero}>
          {article.image && (
            <Image
            src={baseUrl + article.image} 
            alt={lang}
            height={400}
            width={600} placeholder="blur" blurDataURL={blurDataURL} priority/>
          )}
            
            <h2>{article.title}</h2>
            <h4>{article.subtitle}</h4>
            <br />
        </div>
        {article.paragraphs.map((paragraph, index) => (
          <Paragraph key={index} paragraph={paragraph} lang={lang}/>
        ))}
      </article>
  )
}