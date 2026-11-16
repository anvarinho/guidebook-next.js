import styles from './loading-ring.module.css';

/** The navigation emblem with its rays circling; the one loading mark used everywhere. */
export default function LoadingRing({ small = false, leaving = false }: { small?: boolean; leaving?: boolean }) {
  return <span className={`${styles.ring} ${small ? styles.small : ''} ${leaving ? styles.leaving : ''}`} aria-hidden="true">
    <span className={styles.rays}/>
    <span className={styles.center}/>
  </span>;
}
