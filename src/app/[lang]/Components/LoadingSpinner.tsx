import styles from './controls.module.css'
import LoadingRing from './LoadingRing'

export default function LoadingSpinner({ text, detail = false, inline = false, leaving = false }: {
    text: string; detail?: boolean; inline?: boolean; leaving?: boolean;
}) {
    return (
        <div className={`${styles.center} ${detail ? styles.detailCenter : ''} ${inline ? styles.inlineCenter : ''}`}
            data-leaving={leaving || undefined} role="status" aria-live="polite">
            <LoadingRing large={detail} leaving={leaving}/>
            <span className={styles.loadingText}>{text}</span>
        </div>
    );
};
