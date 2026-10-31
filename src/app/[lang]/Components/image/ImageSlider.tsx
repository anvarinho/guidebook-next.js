'use client'
import additionalLabels from '@/translations/ui/app-lang-Components-image-ImageSlider-tsx-labels.json';

import React, { useState, useEffect } from "react";
import styles from './imageSlider.module.css'
import Image from "next/image";
import { imagePlaceholder } from "@/lib/imagePlaceholder";
import type { Locale } from '@/lib/i18n.config';

const labels: Record<Locale, string[]> = {
    ...additionalLabels as Record<Locale, string[]>,
    en: ['Image gallery', 'Previous slide', 'Next slide', 'Pause slideshow', 'Resume slideshow', '{n} of {total}', 'Go to slide {n}'],
    ru: ['Фотогалерея', 'Предыдущий слайд', 'Следующий слайд', 'Приостановить слайд-шоу', 'Возобновить слайд-шоу', '{n} из {total}', 'Перейти к слайду {n}'],
    fr: ['Galerie d’images', 'Diapositive précédente', 'Diapositive suivante', 'Mettre le diaporama en pause', 'Reprendre le diaporama', '{n} sur {total}', 'Aller à la diapositive {n}'],
    de: ['Bildergalerie', 'Vorherige Folie', 'Nächste Folie', 'Diashow pausieren', 'Diashow fortsetzen', '{n} von {total}', 'Zu Folie {n}'],
    es: ['Galería de imágenes', 'Diapositiva anterior', 'Diapositiva siguiente', 'Pausar presentación', 'Reanudar presentación', '{n} de {total}', 'Ir a la diapositiva {n}'],
    it: ['Galleria immagini', 'Diapositiva precedente', 'Diapositiva successiva', 'Metti in pausa', 'Riprendi presentazione', '{n} di {total}', 'Vai alla diapositiva {n}'],
    jp: ['画像ギャラリー', '前のスライド', '次のスライド', 'スライドショーを一時停止', 'スライドショーを再開', '{total}枚中{n}枚目', 'スライド{n}へ移動'],
    kr: ['이미지 갤러리', '이전 슬라이드', '다음 슬라이드', '슬라이드 쇼 일시 정지', '슬라이드 쇼 재개', '{total}개 중 {n}번째', '슬라이드 {n}로 이동'],
    cn: ['图片库', '上一张幻灯片', '下一张幻灯片', '暂停幻灯片', '继续幻灯片', '第{n}张，共{total}张', '跳转到第{n}张'],
    ae: ['معرض الصور', 'الشريحة السابقة', 'الشريحة التالية', 'إيقاف العرض مؤقتًا', 'استئناف العرض', '{n} من {total}', 'الانتقال إلى الشريحة {n}'],
};

const ImageSlider: React.FC<{ items: string[], priority: boolean, blurDataURLs?: string[], lang?: Locale }> = ({ items, priority, blurDataURLs = [], lang = 'en' }) => {
    const t = labels[lang];
    const slideLabel = (template: string, n: number) => template.replace('{n}', String(n)).replace('{total}', String(items.length));
    const [index, setIndex] = useState(1);
    const [paused, setPaused] = useState(false);
    const [motionAllowed, setMotionAllowed] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [explicitPlay, setExplicitPlay] = useState(false);
    const playing = motionAllowed && !paused && (!reducedMotion || explicitPlay) && items.length > 1;
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
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => {
            setReducedMotion(preference.matches);
            setExplicitPlay(false);
            setMotionAllowed(true);
        };
        update();
        preference.addEventListener('change', update);
        return () => preference.removeEventListener('change', update);
    }, []);

    useEffect(() => {
        if (!playing) return;
        const interval = setInterval(() => {
            setIndex(current => current >= items.length ? 1 : current + 1);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [items.length, playing]);

    return (
        <div className={styles.slider_wrapper} role="region" aria-roledescription="carousel" aria-label={t[0]}
            onFocusCapture={() => setPaused(true)} onPointerEnter={() => setPaused(true)}>
            <div className={styles.slider}>
                <div className={styles.slider_items} aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
                    {items.map((image, idx) => (
                        <div key={idx} role="group" aria-roledescription="slide" aria-label={slideLabel(t[5], idx + 1)} aria-hidden={idx + 1 !== index} inert={idx + 1 !== index} className={`${styles.slider_item} ${idx + 1 === index ? styles.active : ''}`}>
                            <Image {...imagePlaceholder(blurDataURLs[idx])} fill src={baseUrl + image} alt={`${image}`} sizes="(max-width: 991px) 100vw, 900px" style={{ objectFit: "cover" }} title={`${image}`}
                             priority={idx == 0 && priority ? true : false}
                             loading={idx == 0 && priority ? 'eager' : 'lazy'}
                             />
                        </div>
                    ))}
                </div>
                {items.length > 1 && (
                    <>
                        <button type="button" aria-label={t[1]} className={`${styles.slider_controls} ${styles.prev}`} onClick={() => changeSlide(-1)}>&#10094;</button>
                        <button type="button" aria-label={t[2]} className={`${styles.slider_controls} ${styles.next}`} onClick={() => changeSlide(1)}>&#10095;</button>
                        <button type="button" className={styles.rotation} aria-label={playing ? t[3] : t[4]} onClick={() => { setPaused(playing); setExplicitPlay(!playing); }}>
                            {playing ? 'Ⅱ' : '▶'}
                        </button>
                        <div className={styles.slider_indicators}>
                            {items.map((image, idx) => (
                                <button type="button" key={idx} aria-label={slideLabel(t[6], idx + 1)} aria-current={idx + 1 === index ? 'true' : undefined} className={`${styles.slider_indicator} ${idx + 1 === index ? styles.active : ''}`} onClick={() => moveTo(idx + 1)}></button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ImageSlider;
