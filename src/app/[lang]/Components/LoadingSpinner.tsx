import styles from './loading-ring.module.css'
import LoadingRing from './LoadingRing'

/** Loading state for content. Full size floats over the dimmed, blurred page; `inline` sits under a list. */
export default function LoadingSpinner({ text, inline = false, leaving = false }: {
    text: string; inline?: boolean; leaving?: boolean;
}) {
    if (inline) {
        return (
            <div className={styles.inline} data-leaving={leaving || undefined} role="status" aria-live="polite">
                <LoadingRing small/>
                <span className={styles.text}>{text}</span>
            </div>
        );
    }
    return (
        <div className={styles.veil} role="status" aria-live="polite">
            <LoadingRing/>
            <span className={styles.text}>{text}</span>
        </div>
    );
};
