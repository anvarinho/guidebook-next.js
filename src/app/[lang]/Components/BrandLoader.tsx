import styles from './brand-loader.module.css';

/**
 * The home page loader's flag mark (src/app/intro), reusable: "page" is identical to the home
 * page's full-screen loader, "inline" is the same mark at content size with a caption.
 */
export default function BrandLoader({ label, size = 'inline' }: { label: string; size?: 'inline' | 'page' }) {
  return (
    <span className={`${styles.loader} ${styles[size]}`} role="status" aria-live="polite">
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.emblem}>
          {/* eslint-disable-next-line @next/next/no-img-element -- same static artwork as the home loader */}
          <img className={styles.brush} src="/intro/optimized/kyrgyz-flag-brush-v2.webp" alt="" fetchPriority="low"/>
          {/* eslint-disable-next-line @next/next/no-img-element -- same static artwork as the home loader */}
          <img className={styles.flag} src="/intro/optimized/flag.webp" alt="" fetchPriority="low"/>
        </span>
      </span>
      <span className={size === 'page' ? styles.srOnly : styles.caption}>{label}</span>
    </span>
  );
}
