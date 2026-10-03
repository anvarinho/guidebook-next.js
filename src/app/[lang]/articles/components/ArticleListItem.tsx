import { Locale } from "@/lib/i18n.config";
import { getDictionary } from "@/lib/dictionary";
import ArticleCard from './ArticleCard';

type Props = {
  article: Article,
  lang: Locale,
  featured?: boolean,
  order?: number,
}

export default async function ArticleListItem({ article, lang, featured, order }: Props) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
  const { page } = await getDictionary(lang);
  const image = article.image || article.paragraphs.find(paragraph => paragraph.image)?.image;
  const imageUrl = image ? baseUrl + image : undefined;
  const date = new Date(article.createdAt);
  const validDate = !Number.isNaN(date.getTime());
  const dateLabel = validDate ? new Intl.DateTimeFormat(page.langCode, {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(date) : undefined;
  const viewsLabels: Record<Locale, string> = {
    en: 'Views', ru: 'Просмотры', ae: 'المشاهدات', fr: 'Vues', de: 'Aufrufe',
    it: 'Visualizzazioni', es: 'Visualizaciones', jp: '閲覧数', kr: '조회수', cn: '浏览量',
  };
  return (
    <ArticleCard title={article.title} subtitle={article.subtitle} href={`/${lang}/articles/${article.url}`}
      imageUrl={imageUrl} featured={featured} order={order}
      dateLabel={dateLabel} dateTime={validDate ? date.toISOString() : undefined}
      views={new Intl.NumberFormat(page.langCode).format(article.viewCount)} viewsLabel={viewsLabels[lang]}/>
  )
}
