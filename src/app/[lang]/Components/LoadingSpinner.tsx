import styles from './page.module.css'

export default function LoadingSpinner({ text, detail = false }: { text: string; detail?: boolean }) {
    return (
        <div className={`${styles.center} ${detail ? styles.detailCenter : ''}`} role="status" aria-live="polite">
            <div className={styles.ring} aria-hidden="true"></div>
            <span className={styles.loadingText}>{text}</span>
        </div>
    );
};
