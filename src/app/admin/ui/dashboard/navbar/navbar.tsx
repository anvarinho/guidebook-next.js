"use client";
import { usePathname } from "next/navigation";
import styles from "./navbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faComment, faGlobe, faSearch } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div className={styles.container}>
      <div className={styles.title}>{pathname.split("/").pop()}</div>
      <div className={styles.menu}>
        <div className={styles.search}>
        <FontAwesomeIcon icon={faSearch} />
          <input type="text" placeholder="Search..." className={styles.input} />
        </div>
        <div className={styles.icons}>
        <FontAwesomeIcon icon={faComment} />
        <FontAwesomeIcon icon={faBell} />
        <FontAwesomeIcon icon={faGlobe} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;