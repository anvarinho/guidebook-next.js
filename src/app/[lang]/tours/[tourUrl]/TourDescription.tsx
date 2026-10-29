import styles from './page.module.css';
import { PlacesRevealContent } from '../../places/components/PlacesMotion';
import { renderContentHtml } from '@/lib/contentHtml.server';

export default function TourDescription({ description, lang = 'en' }: { description: string; lang?: string }) {
  return <PlacesRevealContent className={styles.tourContainer} html={renderContentHtml(description, { lang, classes: styles })} />;
}