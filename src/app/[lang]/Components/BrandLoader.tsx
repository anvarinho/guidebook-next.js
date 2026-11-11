import styles from './brand-loader.module.css';

/**
 * The site's loading mark, matching the home page loader: the flag's rays turn slowly around an
 * upright center. "page" is the full-screen route loader; "inline" sits inside page content.
 */
export default function BrandLoader({ label, size = 'inline' }: { label?: string; size?: 'inline' | 'page' }) {
  return (
    <span className={`${styles.loader} ${styles[size]}`} role="status" aria-live="polite">
      <span className={styles.emblem} aria-hidden="true">
        <span className={styles.rays}/>
        <span className={styles.center}/>
      </span>
      {label && <span className={styles.caption}>{label}</span>}
    </span>
  );
}
