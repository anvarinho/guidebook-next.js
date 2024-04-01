import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield } from '@fortawesome/free-solid-svg-icons';
import styles from "./card.module.css";

const Card = ({ item }) => {
  return (
    <div className={styles.container}>
        <FontAwesomeIcon icon={faUserShield} size="sm"/>
        <div className={styles.texts}>
        <span className={styles.title}>{item.title}</span>
        <span className={styles.number}>{item.number}</span>
        <span className={styles.detail}>
          <span className={item.change > 0 ? styles.positive : styles.negative}>
            {item.change}%
          </span>{" "}
          {item.change > 0 ? "more" : "less"} than previous week
        </span>
      </div>
    </div>
  );
};

export default Card;