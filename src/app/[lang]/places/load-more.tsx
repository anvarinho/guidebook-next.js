'use client'

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Locale } from "@/lib/i18n.config";
import styles from './page.module.css'
import Link from "next/link";
import Image from "next/image";

export function LoadMore({ lang }: { lang: Locale }) {
    const [places, setPlaces] = useState<PlaceAlias[]>([]);
    const [page, setPage] = useState(0);
    const { ref, inView } = useInView();
    const [isLoading, setIsLoading] = useState(false);
    const baseUrl = `${process.env.NEXT_PUBLIC_URL}/`;

    const loadMorePlaces = async () => {

        setIsLoading(true)
        const nextPage = page + 1;
        const url = `${process.env.NEXT_PUBLIC_URL}/api/places/more?lang=${lang}&offset=${nextPage * 12}&limit=12`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            setPlaces((prevPlaces) => [...prevPlaces, ...data.places]);
            setPage(nextPage);
            setIsLoading(false)
        } catch (error) {
            console.error("Error fetching places:", error);
        }
    };

    useEffect(() => {
        if (inView) {
            loadMorePlaces();
        }
    }, [inView]);

    const loadingTexts = {
        loading: {
            en: 'Loading',
            es: 'Cargando',
            fr: 'Chargement',
            de: 'Laden',
            it: 'Caricamento',
            ru: 'Загрузка',
            kr: '로딩 중',
            cn: '加载中',
            jp: '読み込み中',
            ae: 'جار التحميل'
        },
        noPlaces: {
            en: 'No more places yet...',
            es: 'Aún no hay más lugares...',
            fr: 'Pas plus de lieux pour l\'instant...',
            de: 'Keine weiteren Orte bisher...',
            it: 'Ancora non ci sono altri posti...',
            ru: 'Пока нет больше мест...',
            kr: '아직 더 이상의 장소가 없습니다...',
            cn: '暂时没有更多地方...',
            jp: 'まだ場所はありません...',
            ae: 'لا توجد مزيد من الأماكن بعد...'
        }
    };    

    return (
        <>
            {places.length !== 0 ? (
                places.map((place) => (
                    // <PlaceListItem key={place._id} place={place} lang={lang}/>
                    <Link className={styles.placeBox} key={place._id} href={`places/${place.url}`}>
                    <Image
                        src={baseUrl + place.images[0]}
                        alt={place.name}
                        className={styles.placeImg}
                        height={360}
                        width={640}
                        sizes='(max-width: 768px) 100%, (max-width: 1200px) 50%, 33%' 
                        priority/>
                        <h4>{place.title}</h4>
                        <h6>{place.region}</h6>
                    </Link>
                ))
            ) : (
                <></>
            )}
            {isLoading && places.length < 140 ? (
                <div className={styles.center}>
                    <div className={styles.ring}></div>
                    <span className={styles.loadingText}>{loadingTexts.loading[lang]}</span>
                </div>
            ):(
                <h5 ref={ref}>{loadingTexts.noPlaces[lang]}</h5>
            )}
        </>
    );
}

