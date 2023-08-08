// import React from 'react';
"use client";
import React, { useState, useEffect } from "react";
import styles from './page.module.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

import {
  faPhone
} from "@fortawesome/free-solid-svg-icons";

const ContactButton = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        // Function to handle the scroll event
        const handleScroll = () => {
        const scrollY = window.scrollY;
        // Set a threshold value for when to toggle the class
        const scrollThreshold = 100;

        // Check if the user has scrolled beyond the threshold
        if (scrollY > scrollThreshold) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
        };

        // Add the scroll event listener when the component mounts
        window.addEventListener('scroll', handleScroll);

        // Clean up the scroll event listener when the component unmounts
        return () => {
        window.removeEventListener('scroll', handleScroll);
        };
    }, [isScrolled]);
    return (
        <div className={`${styles.contactBtn} ${isScrolled ? '' : styles.active}`}>
            <Link href="https://wa.me/79999858060?text=Hello!!!" target="_blank">
                <FontAwesomeIcon className={styles.phoneIcon} icon={faPhone} />
            </Link>
        </div>
    );
};

export default ContactButton;