import styles from './page.module.css'
import { Metadata } from 'next'
import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import getAllTours from '@/lib/getAllTours'
import Image from "next/image";
import getBase64 from "@/lib/getLocalBase64"


export default async function Home({
  params: {lang}
}: {
  params: {lang : Locale}
}) {
    const { page } = await getDictionary(lang)
    const data: Promise<[Tour]> = getAllTours()
    const toursData = await data
    const baseUrl = 'http://159.65.95.44/';
    // const blurDataURL = await getBase64(baseUrl + place.images[0])
    // console.log(toursData)
    return (
      <div className={styles.main}>
        <h1>{page.tours.title}</h1>
        <div className={styles.toursDiv}>
          <div className={styles.toursList}>
          {toursData.map((tour, index) => (
            <a key={index} href={`tours/${tour.url}`} className={styles.tourBox}>
              <Image
                fill
                src={baseUrl + tour.images[0]}
                alt={tour.url}
                //  sizes='(max-width: 768px) 100%, (max-width: 1200px) 50%, 33%' 
                objectFit='cover'
                />
              <h3>{tour.title} {tour.days.length}</h3></a>
          ))}
          </div>
        </div>
      </div>
    )
}

export async function generateMetadata({
  params: {lang}
}: {
  params: {lang : Locale}
}): Promise<Metadata> {
  const { page } = await getDictionary(lang)
  return {
    title: {
      absolute: page.tours.title + ' | ' + page.name
    },
      description: page.tours.description,
      keywords: page.tours.keywords,
  }
}