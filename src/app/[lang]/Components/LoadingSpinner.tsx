import styles from './page.module.css'

export default async function LoadingSpinner({ text }: { text: String }) {
    return (
        <div className={styles.center} role="status" aria-live="polite">
            <div className={styles.ring} aria-hidden="true"></div>
            <span className={styles.loadingText}>{text}</span>
        </div>
    );
};
