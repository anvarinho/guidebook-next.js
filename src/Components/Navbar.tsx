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
        // Function to handle scroll event
        const handleScroll = () => {
          // Calculate the scroll position or any other logic to determine when to toggle the navbar
          // For example, you can use `window.scrollY` to get the vertical scroll position
          const scrollPosition = window.scrollY;
    
          // Update the showNavbar state based on the scroll position
          // For example, show the navbar if the scroll position is below 100 pixels from the top
          setShowNavbar(scrollPosition > 100 || scrollPosition < 100 );
        };
    
        // Add the scroll event listener when the component mounts
        if(showNavbar){
            window.addEventListener('scroll', handleScroll);
        }
        
    
        // Remove the scroll event listener when the component unmounts to avoid memory leaks
        return () => {
            if(showNavbar){
                window.removeEventListener('scroll', handleScroll);
            }
        };
      }, []);
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
                        <FontAwesomeIcon icon={faBars} />
                    ) : (
                        <FontAwesomeIcon icon={faXmark} />
                    )}
                </a>
            </section>
        </header>
    );
};

export default Navbar;