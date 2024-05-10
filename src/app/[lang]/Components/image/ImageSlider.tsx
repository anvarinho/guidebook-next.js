'use client'
import React, { useState, useEffect } from "react";
import styles from './imageSlider.module.css'
import Image from "next/image";

const ImageSlider: React.FC<{ items: [String] }> = ({ items }) => {
    const [index, setIndex] = useState(1);
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;

    const moveTo = (newIndex: number) => {
        setIndex(newIndex);
    }

    const changeSlide = (step: number) => {
        let newIndex = index + step;
        if (newIndex < 1) {
            newIndex = items.length;
        } else if (newIndex > items.length) {
            newIndex = 1;
        }
        setIndex(newIndex);
    }

    useEffect(() => {
        const interval = setInterval(() => {
            changeSlide(1);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [index]);

    return (
        <div className={styles.slider_wrapper}>
            <div className={styles.slider}>
                <div className={styles.slider_items}>
                    {items.map((image, idx) => (
                        <picture key={idx} className={`${styles.slider_item} ${idx + 1 === index ? styles.active : ''}`}>
                            <Image fill src={baseUrl + image} alt={`${image}`} objectFit="cover" title={`${image}`} />
                        </picture>
                    ))}
                </div>
                {items.length > 1 && (
                    <>
                        <span className={`${styles.slider_controls} ${styles.prev}`} onClick={() => changeSlide(-1)}>&#10094;</span>
                        <span className={`${styles.slider_controls} ${styles.next}`} onClick={() => changeSlide(1)}>&#10095;</span>
                        <div className={styles.slider_indicators}>
                            {items.map((image, idx) => (
                                <span key={idx} className={`${styles.slider_indicator} ${idx + 1 === index ? styles.active : ''}`} onClick={() => moveTo(idx + 1)}></span>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageSlider;