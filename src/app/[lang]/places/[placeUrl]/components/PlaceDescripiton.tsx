import styles from '../page.module.css';
import { PlacesRevealContent } from '../../components/PlacesMotion';
import { renderContentHtml } from '@/lib/contentHtml.server';

interface Props {
  text: string | Record<string, string>;
  highlights: string[];
  name: string;
  lang?: string;
}

export default function PlaceDescription({ text, highlights = [], lang = 'en' }: Props) {
  const content = typeof text === 'string' ? text : text[lang] || text.en || Object.values(text)[0] || '';
  return <PlacesRevealContent className={styles.container} html={renderContentHtml(content, { lang, highlights, classes: styles })} />;
}