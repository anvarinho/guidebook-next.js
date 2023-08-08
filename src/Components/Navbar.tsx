// import React from 'react';
"use client";
import React, { useState, useEffect } from "react";
import styles from './page.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faBars,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

const Navbar = () => {
    const [showNavbar, setShowNavbar] = useState(false);
    const handleToggleNavbar = () => {
        setShowNavbar((showNavbar) => !showNavbar);
        console.log("Clicked")
    };
    useEffect(() => {
        window.onscroll = () =>{
            if (showNavbar){
                setShowNavbar(false)
            }
        }
      }, [showNavbar]);
    const navLinks = [
        { text: 'Home', url: '/' },
        { text: 'Sights', url: '/places' },
        { text: 'Tours', url: '/tours' },
        { text: 'About', url: '/about' },
        { text: 'Contact', url: '/contact' },
      ];
    
    return (
        <header className={styles.header}>
            <section className={styles.flex}>
                <a href="/" className={styles.logo}>GuideBook of Kyrgyzstan</a>
                <nav className={`${styles.navbar} ${showNavbar ? styles.active : ''}`}>
                    <a className="/" href="/">Home</a>
                    <a className="" href="/places">Sights</a>
                    <a className="" href="/tours">Tours</a>
                    <a className="" href="/about">About</a>
                    <a className="" href="/contact">Contact</a>
                </nav>
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
            </section>
        </header>
    );
};

export default Navbar;