"use client";
import styles from './page.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect } from "react";
import { usePathname } from 'next/navigation'

import {
  faBars,
  faL,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

export default function MenuButton() {
    const [showNavbar, setShowNavbar] = useState(false);
    const pathname = usePathname();

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

    useEffect(()=>{
        if(showNavbar){
            // console.log(pathname, showNavbar)
            handleToggleNavbar()
        }
    },[pathname])


    
    return (
        <button className={styles.menuBtn} onClick={handleToggleNavbar} aria-label="Toggle menu visibility">
            {!showNavbar ? (
                <>
                <FontAwesomeIcon icon={faBars} />
                </>
            ) : (
                <>
                <FontAwesomeIcon icon={faXmark} />
                </>
            )}
        </button>
    )
}
