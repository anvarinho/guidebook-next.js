import styles from './FlagSun.module.css';

export default function FlagSun() {
  return (
    <div className={styles.sunDecoration} aria-hidden="true">
      <div className={styles.sun} />
    </div>
  );
}
