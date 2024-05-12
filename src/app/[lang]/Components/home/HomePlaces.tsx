"use client";
import React, { useState, useEffect } from "react";
import styles from './homeplaces.module.css'
import { Locale } from "@/lib/i18n.config";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ImageLoader from "../image/ImageLoader";
import Link from "next/link";
import { getHomePlaces } from "@/lib/getAllPlaces";
import {
    faArrowLeft,
    faArrowRight
  } from "@fortawesome/free-solid-svg-icons";

const HomePlaces: React.FC<{ lang: Locale }> = ({ lang }) => {
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;
    const [currentSlide, setCurrentSlide] = useState(0);
    const [places, setPlaces] = useState<any[]>([]);
    
    const handleSlideLeft = () => {
        if (currentSlide > 0) {
          setCurrentSlide(currentSlide - 1);
        }
    };
    
    const handleSlideRight = () => {
        if (currentSlide < places.length - 1) { // Adjusted condition for correct end behavior
            setCurrentSlide(currentSlide + 1);
        }
    };    
    useEffect(() => {
        const fetchData = async () => {
            const places = await getHomePlaces(lang)
            setPlaces(places)
        };
        fetchData();
    }, []);
    
    const dictionary = {
        morePlaces : {
            en: 'More Places',
            es: 'Más lugares',
            fr: 'Plus de lieux',
            de: 'Weitere Orte',
            it: 'Altri luoghi',
            ru: 'Больше достопримечательностей',
            kr: '더 많은 장소',
            cn: '更多地方',
            jp: '他の場所',
            ae: 'المزيد من الأماكن'
        },
        readMore :{
            en: 'Read More',
            es: 'Leer más',
            fr: 'Lire la suite',
            de: 'Mehr erfahren',
            it: 'Leggi di più',
            ru: 'Читать далее',
            kr: '더 읽기',
            cn: '阅读更多',
            jp: '続きを読む',
            ae: 'اقرأ المزيد'
        },
        title: {
            en: 'Kyrgyzstan',
            es: 'Kirguistán',
            fr: 'Kirghizistan',
            de: 'Kirgisistan',
            it: 'Kirghizistan',
            ru: 'Кыргызстан',
            kr: '키르기스스탄',
            cn: '吉尔吉斯斯坦',
            jp: 'キルギス',
            ae: "قيرغيزستان"
        },
        description: {
            en: 'Discover the unexplored beauty of Kyrgyzstan with our comprehensive Guidebook, your passport to an enchanting land of natural wonders, vibrant culture, and timeless traditions. This meticulously crafted guide is your trusted companion for an unforgettable expedition through this Central Asian gem.',
            es: 'Descubre la belleza inexplorada de Kirguistán con nuestra Guía completa, tu pasaporte a una tierra encantadora de maravillas naturales, cultura vibrante y tradiciones',
            fr: 'Découvrez la beauté inexplorée du Kirghizistan avec notre Guide complet, votre passeport pour une terre enchantée de merveilles naturelles, de culture vibrante et de traditions intemporelles.',
            de: 'Entdecken Sie die unerforschte Schönheit von Kirgisistan mit unserem umfassenden Reiseführer, Ihrem Pass in ein zauberhaftes Land voller natürlicher Wunder, lebendiger Kultur und zeitloser Traditionen.',
            it: 'Scopri la bellezza inesplorata del Kirghizistan con la nostra guida completa, il tuo passaporto per una terra incantata di meraviglie naturali, cultura vibrante e tradizioni senza tempo.',
            ru: 'Откройте для себя неизведанную красоту Кыргызстана с нашим всесторонним путеводителем, вашим паспортом в волшебную страну природных чудес, яркой культуры и вечных традиций.',
            kr: '키르기스스탄의 미탐 탐험의 아름다움을 저희의 포괄적인 가이드북으로 발견하세요. 자연의 경이, 활기찬 문화 및 시대를 초월한 전통이 어우러진 이 중앙아시아 보석을 향한 잊지 못할 탐험을 위한 신뢰할 수 있는 동반자입니다.',
            cn: '使用我们全面的指南，探索吉尔吉斯斯坦的未知美景，这是您通往自然奇观、充满活力的文化和永恒传统的迷人土地的护照。这本精心制作的指南是您在这个中亚宝石中进行难忘探险的可靠伴侣。',
            jp: 'われわれの包括的なガイドブックでキルギスの未踏の美しさを発見し、自然の驚異、活気あふれる文化、そして時代を超えた伝統に満ちた魅力的な土地へのあなたのパスポートとなる。この細心に作り上げられたガイドは、この中央アジアの宝石を通る忘れられない探検のためのあなたの信頼できる仲間です。',
            ae: "اكتشف جمال قيرغيزستان غير المكتشف مع كتابنا الشامل، جواز سفرك إلى أرض ساحرة من عجائب الطبيعة وثقافة حية وتقاليد خالدة. هذا الدليل المُحرَّف بعناية هو رفيقك الموثوق لرحلة لا تُنسى عبر هذه الجوهرة الوسطية الآسيوية."
        },
        places: {
            en: 'Places to Visit',
            es: 'Lugares para Visitar',
            fr: 'Lieux à Visiter',
            de: 'Orte zu besuchen',
            it: 'Luoghi da Visitare',
            ru: 'Места для посещения',
            kr: '방문할 장소',
            cn: '参观的地方',
            jp: '訪れる場所',
            ae: "الأماكن للزيارة"
        },
        articles: {
            en: 'Facts About Kyrgyzstan',
            es: 'Datos sobre Kirguistán',
            fr: 'Faits sur le Kirghizistan',
            de: 'Fakten über Kirgisistan',
            it: 'Fatti sul Kirghizistan',
            ru: 'Факты о Кыргызстане',
            kr: '키르기스스탄에 관한 사실',
            cn: '关于吉尔吉斯斯坦的事实',
            jp: 'キルギスタンに関する事実',
            ae: "حقائق عن قيرغيزستان"
        },
        tours: {
            en: 'Our Tours',
            es: 'Nuestros Tours',
            fr: 'Nos Tours',
            de: 'Unsere Touren',
            it: 'I Nostri Tour',
            ru: 'Наши туры',
            kr: '우리 투어',
            cn: '我们的旅游',
            jp: '私たちのツアー',
            ae: "جولاتنا"
        }
    };

    return (
        <div className={styles.placesSection} id="places">
            {places.length > 0 ? (
                places.slice(currentSlide, currentSlide + 12).map((place) => (
                    <div key={place._id} className={styles.slideImages}>
                        <Image fill src={baseUrl + place.images[0]} alt={'arrow down'} loading="lazy" objectFit='cover'/>
                        {/* <ImageLoader image={place.images[0]}/> */}
                        <div className={styles.coverGradient}></div>
                        <div className={styles.blurGradient}></div>
                        <div className={styles.content}>
                            <h2>{place.name}</h2>
                            <p>{place.description} ...</p>
                            <div className={styles.floatingbuttons}>
                                <Link href={`/${lang}/places/${place.url}`} className={styles.floatingButton} title={place.title} rel="noopener noreferrer">{dictionary.readMore[lang]}</Link>
                                <Link href={`/${lang}/places`} className={styles.floatingButton} title="Kyrgyzstan Where To Go!" rel="noopener noreferrer">{dictionary.morePlaces[lang]}</Link>
                            </div>
                        </div>
                    </div>
                    
                ))
            ) : (
                <div className={styles.readMore}>
                    <h2>{dictionary.title[lang]}</h2>
                    <h4>{dictionary.description[lang]}</h4>
                    <div>
                        <Link href={`/${lang}/places`} title="Kyrgyzstan Where To Go!" className={styles.floatingButton} >{dictionary.places[lang]}</Link>
                        <Link href={`/${lang}/articles`} title="The Kyrgyzstan: on Culture, Traditions, and Nature" className={styles.floatingButton} >{dictionary.articles[lang]}</Link>
                        <Link href={`/${lang}/tours`} title="Private tours in Kyrgyzstan!" className={styles.floatingButton} >{dictionary.tours[lang]}</Link>
                    </div>
                </div>
            )}

            {places.length > 0 && (
                <div className={styles.buttons}>
                    <button onClick={handleSlideLeft} disabled={currentSlide === 0}>
                        <FontAwesomeIcon icon={faArrowLeft} />
                    </button>
                    <button onClick={handleSlideRight} disabled={currentSlide === places.length - 2}>
                        <FontAwesomeIcon icon={faArrowRight} />
                    </button>
                </div>
            )}
        </div>
    );
    
};

export default HomePlaces;