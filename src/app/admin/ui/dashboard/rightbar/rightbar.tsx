import Image from "next/image";
import styles from "./rightbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlayCircle, // Equivalent to MdPlayCircleFilled
    faAngleDoubleRight, // Equivalent to MdReadMore
  } from '@fortawesome/free-solid-svg-icons';

const Rightbar = () => {
  return (
    <div className={styles.container}>
      <div className={styles.item}>
        <div className={styles.bgContainer}>
          <Image className={styles.bg} src="/astronaut.png" alt="" fill />
        </div>
        <div className={styles.text}>
          <span className={styles.notification}>🔥 Available Now</span>
          <h3 className={styles.title}>
            How to use the new version of the admin dashboard?
          </h3>
          <span className={styles.subtitle}>Takes 4 minutes to learn</span>
          <p className={styles.desc}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Reprehenderit eius libero perspiciatis recusandae possimus.
          </p>
          <button className={styles.button}>
          <FontAwesomeIcon icon={faPlayCircle} size="sm" />
            Watch
          </button>
        </div>
      </div>
      <div className={styles.item}>
        <div className={styles.text}>
          <span className={styles.notification}>🚀 Coming Soon</span>
          <h3 className={styles.title}>
            New server actions are available, partial pre-rendering is coming
            up!
          </h3>
          <span className={styles.subtitle}>Boost your productivity</span>
          <p className={styles.desc}>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Reprehenderit eius libero perspiciatis recusandae possimus.
          </p>
          <button className={styles.button}>
          <FontAwesomeIcon icon={faAngleDoubleRight} size="sm" />
            Learn
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rightbar;