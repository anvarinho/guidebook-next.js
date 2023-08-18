"use client";
import styles from './page.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";

import {
  faBars,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

export default function MenuButton() {
    const [showNavbar, setShowNavbar] = useState(false);
    
    const handleToggleNavbar = () => {
        const navbarElement = document.querySelector(`.${styles.navbar}`);
        setShowNavbar((showNavbar) => !showNavbar);
        if (navbarElement) {
            navbarElement.classList.toggle(`${styles.active}`);
        }
    };

    useEffect(() => {
        window.onscroll = () =>{
            if (showNavbar){
                setShowNavbar(false)
                const navbarElement = document.querySelector(`.${styles.navbar}`);
                if (navbarElement) {
                    navbarElement.classList.remove(`${styles.active}`);
                }
            }
        }
      }, [showNavbar]);
    
    return (
        <a className={styles.menuBtn} onClick={handleToggleNavbar}>
            {!showNavbar ? (
                <>
                <FontAwesomeIcon icon={faBars} />
                </>
            ) : (
                <>
                <FontAwesomeIcon icon={faXmark} />
                </>
            )}
        </a>
    )
}
