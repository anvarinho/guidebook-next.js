import styles from './page.module.css'
import LoadingRing from './LoadingRing'

export default function LoadingSpinner({ text, detail = false }: { text: string; detail?: boolean }) {
    return (
        <div className={`${styles.center} ${detail ? styles.detailCenter : ''}`} role="status" aria-live="polite">
            <LoadingRing large={detail}/>
            <span className={styles.loadingText}>{text}</span>
        </div>
    );
};
