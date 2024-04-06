import styles from '../articles.module.css'
import Link from "next/link";
import getBase64 from "@/lib/getLocalBase64"
import { Locale } from "@/lib/i18n.config";
import { getDictionary } from "@/lib/dictionary";

import Image from "next/image";

type Props = {
  article: Article,
  lang: Locale,
}

export default async function ArticleListItem({ article, lang }: Props) {
  const baseUrl = 'http://159.65.95.44/';
  
  let imageUrl = article.image ? article.image : article.paragraphs[0].image
  const blurDataURL = await getBase64(baseUrl + imageUrl)
  return (
    <Link href={`articles/${article.url}`} key={article._id} className={styles.articleBox}>
        <Image
            src={baseUrl + imageUrl}
            alt={`${article.image}`}
            className={styles.articleImg}
            height={100}
            width={100}
            placeholder="blur" 
            blurDataURL={blurDataURL} 
            priority/>
        <div className={styles.cardContent}>
            <h4>{article.title}</h4>
            <div className={styles.cardBottom}>
                <h6>{String(article.createdAt)}</h6><h6>{article.viewCount}</h6>
            </div>
        </div> 
    </Link>
  )
}