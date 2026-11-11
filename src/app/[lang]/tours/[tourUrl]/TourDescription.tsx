import styles from './page.module.css';
import { renderContentHtml } from '@/lib/contentHtml.server';

export default function TourDescription({ description, lang = 'en' }: { description: string; lang?: string }) {
  return <div className={styles.tourContainer} dangerouslySetInnerHTML={{ __html: renderContentHtml(description, { lang, classes: styles }) }} />;
}