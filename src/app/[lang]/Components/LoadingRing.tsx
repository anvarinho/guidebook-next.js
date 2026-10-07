import styles from './loading-ring.module.css';

export default function LoadingRing({ large = false }: { large?: boolean }) {
  return <span className={`${styles.ring} ${large ? styles.large : ''}`} aria-hidden="true" />;
}
