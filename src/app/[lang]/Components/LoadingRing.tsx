import styles from './loading-ring.module.css';

export default function LoadingRing({ large = false, leaving = false }: { large?: boolean; leaving?: boolean }) {
  return <span className={`${styles.ring} ${large ? styles.large : ''} ${leaving ? styles.leaving : ''}`} aria-hidden="true" />;
}
