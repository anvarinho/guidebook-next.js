import styles from './page.module.css'

export default async function LoadingSpinner({ text }: { text: String }) {
    return (
        <div className={styles.center}>
            <div className={styles.ring}></div>
            <span className={styles.loadingText}>{text}</span>
        </div>
    );
};