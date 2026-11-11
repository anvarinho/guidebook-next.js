import { articleImageAlt } from '@/lib/articleImageAlt';
import getBase64 from '@/lib/getLocalBase64';
import { imagePlaceholder } from '@/lib/imagePlaceholder';
import ArrowIcon from '@/components/ArrowIcon';
import styles from '../page.module.css'
import { Locale } from "@/lib/i18n.config";
import { isRtlLocale } from '@/lib/localeMetadata';
import HeroOverlay from '../../../Components/motion/HeroOverlay';
import SectionDots from '../../../Components/SectionDots';
import Paragraph from './Paragraph'
import { getDictionary } from '@/lib/dictionary'

import BlurImage from '@/components/BlurImage';

type Props = {
  article: Article,
  lang: Locale,
}

export default async function Article({ article, lang }: Props) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const createdAtDate = new Date(article.createdAt);
  const dayOfMonth = createdAtDate.toLocaleString();
  const { page } = await getDictionary(lang)
  const views = new Intl.NumberFormat(page.langCode).format(article.viewCount)
  const sections = [
    ...(article.image ? [{ id: 'article-overview', label: article.title }] : []),
    ...article.paragraphs.flatMap((paragraph, index) => paragraph.title ? [{ id: `paragraph-${index + 1}`, label: paragraph.title }] : []),
  ]
  return (
    <article className={styles.article}>
        {article.image && (
          <div id="article-overview" data-hero-track>
          <div className={styles.heroImage} data-hero-sticky>
              <picture className={styles.image} style={article.url === 'what-is-kyrgyzstan-known-for' ? { aspectRatio: '1600 / 900' } : undefined}>
                <BlurImage
                {...imagePlaceholder(getBase64(article.image))}
                src={baseUrl + article.image} 
                alt={articleImageAlt(article.image, lang, article.title)}
                sizes={article.url === 'what-is-kyrgyzstan-known-for' ? "(max-width: 700px) calc(100vw - 32px), (max-width: 991px) calc(100vw - 48px), (max-width: 1280px) calc(100vw - 80px), 1200px" : "(min-width: 800px) 546px, (min-width: 760px) calc(-795vw + 6752px), (min-width: 620px) 526px, calc(92vw - 26px)"}
                fill 
                priority
                />
              </picture>
              <HeroOverlay dir={isRtlLocale(lang) ? 'rtl' : 'ltr'} eyebrow={page.articles.name} title={article.title} cards={[
                { text: article.subtitle },
                { value: views, text: page.info.seen.replace(/[:：]\s*$/, '') },
              ]}/>
          </div>
          </div>
        )}
        <div className={styles.articleLayout}>
          <div className={styles.body}>
            {article.paragraphs.map((paragraph, index) => (
              <Paragraph key={index} id={`paragraph-${index + 1}`} paragraph={paragraph} lang={lang} priority={index === 0 && !article.image}/>
            ))}
          </div>
          <aside className={styles.aside}>
            <div className={styles.asideInner} data-reveal>
              <p className={styles.asideLabel}>{page.articles.name}</p>
              <p className={styles.asideText}>{article.title}</p>
              <a href="#article-end" className={styles.asideLink}><ArrowIcon direction="down"/> <span>{page.info.seen}{article.viewCount}</span></a>
            </div>
          </aside>
        </div>
        <div id="article-end" className={styles.info}>
          <time dateTime={article.createdAt.toLocaleString()}>{page.info.created}{dayOfMonth}</time>
          <span>{page.info.seen}{views}</span>
        </div>
        <SectionDots sections={sections} lang={lang} dir={isRtlLocale(lang) ? 'rtl' : 'ltr'}/>
      </article>
  )
}
