"use client";
import React, { useState, useEffect } from "react";
import styles from './page.module.css'
import { Locale } from "@/lib/i18n.config";
import Image from "next/image";
import getAllPlaces from "@/lib/getAllPlaces";

// const ImageSlider: React.FC<{ lang: Locale }> = ({ lang }) => {
//     const [data, setData] = useState();
//     const baseUrl = 'http://127.0.0.1:4000/';
//     const [currentSlide, setCurrentSlide] = useState(0);
//     const visiblePlaces = data?.places?.slice(currentSlide, currentSlide + 2);
//     const handleSlideLeft = () => {
//         if (currentSlide > 0) {
//           setCurrentSlide(currentSlide - 1);
//         }
//     };
    
//     const handleSlideRight = () => {
//         if (currentSlide < data.places?.length - 2) {
//             setCurrentSlide(currentSlide + 1);
//         }
//     };
    

//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//             const data  = await getAllPlaces(lang);
//             setData(data)
//             console.log(data)
//             } catch (error) {
//               console.error('Error fetching data:', error);
//             }
//         };
//         fetchData();
//     }, []);
//     return (
//         <div className={styles.imageSlider} id="slider">
//             <button onClick={handleSlideLeft} disabled={currentSlide === 0}>
//             Left
//             </button>
//         {data && data.places && (
//             <>
//             {visiblePlaces.map((place) => (
//             <div key={place._id} className={styles.imagesDiv}>
//                 <Image src={baseUrl + place.images[0]} alt={`google-logo.png`} width="220" height="140" />
//             </div>
//             ))}
//             </>
//         )}
//         <button onClick={handleSlideRight} disabled={currentSlide === data?.places?.length - 2}>
//             Right
//         </button>
//     </div>
        
//     );
// };

// export default ImageSlider;