import getArticle from '@/lib/getArticle';
import { ogContentType, ogSize, renderFallbackCard, renderOgCard } from '@/lib/ogImage';

export const alt = 'Article about Kyrgyzstan';
export const size = ogSize;
export const contentType = ogContentType;
// Cards are rendered from CMS content; refresh hourly (admin saves revalidate sooner).
export const revalidate = 3600;

export default async function Image(props: { params: Promise<{ articleUrl: string }> }) {
  const { articleUrl } = await props.params;
  const article = await getArticle(articleUrl, 'en');
  if (!article) return renderFallbackCard();
  const image = article.image || article.paragraphs.find(paragraph => paragraph.image)?.image;
  return renderOgCard({ eyebrow: 'Article', title: article.title, detail: article.subtitle, image });
}
