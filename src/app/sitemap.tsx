import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n.config';
import { sitemapPlaces } from '@/lib/getAllPlaces';
import { sitemapArticles } from '@/lib/getAllArticles';
import { sitemapTours } from '@/lib/getAllTours';
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap>  {
    const URL = "https://central-asia.live";
    const languages = i18n.locales;
    // const languages = ['en', 'de', 'fr', 'it', 'es', 'kr', 'jp', 'cn', 'ae', 'ru']
    // const placesData = await generateStaticParamsPlaces();
    // const articlesData = await generateStaticParamsArticles()
    const places = await sitemapPlaces()
    const articles = await sitemapArticles()
    const tours = await sitemapTours()
    const routes = ["/", "/places", "/tours", "/about", "/articles"];
    const currentDate = new Date().toISOString();
    
    const pages = [];

    for (const lang of languages) {
        for (const route of routes) {
            pages.push({
                url: `${URL}/${lang}${route}`,
                lastModified: currentDate,
                changefreq: 'monthly',
                priority: 0.8
            });
        }
        for (const place of places) {
            // console.log(`${placeItem.lastModified}:  ${placeItem.placeUrl}`)
            pages.push({
                url: `${URL}/${lang}/places/${place.placeUrl}`,
                lastModified: place.lastModified,
                changefreq: 'monthly',
                priority: 0.8
            });
        }
        for (const article of articles) {
            // console.log(`${placeItem.lastModified}:  ${placeItem.placeUrl}`)
            pages.push({
                url: `${URL}/${lang}/articles/${article.placeUrl}`,
                lastModified: article.lastModified,
                changefreq: 'monthly',
                priority: 0.9
            });
        }
        for (const tour of tours) {
            // console.log(`${placeItem.lastModified}:  ${placeItem.placeUrl}`)
            pages.push({
                url: `${URL}/${lang}/tours/${tour.tourUrl}`,
                lastModified: "2024-04-04T19:51:29.199Z",
                changefreq: 'monthly',
                priority: 1
            });
        }
    }
    return pages;
}

// export async function generateStaticParamsPlaces(){
//     const loadPlaces = async () => {
//         const url = `http://127.0.0.1:4000/places/more?offset=0&limit=160`;
//         try {
//             const response = await fetch(url);
//             const data = await response.json();
//             return data
//         } catch (error) {
//             console.error("Error fetching places:", error);
//         }
//     };
//     const data: Promise<[Place]> = loadPlaces()
//     const placesData = await data
//     return placesData.map( placeItem => ({
//         placeUrl: placeItem.url,
//         lastModified: placeItem.created
//     }))
// }

// export async function generateStaticParamsArticles(){
//     const loadArticles = async () => {
//         const url = `http://127.0.0.1:4000/articles`;
//         try {
//             const response = await fetch(url);
//             const data = await response.json();
//             return data
//         } catch (error) {
//             console.error("Error fetching places:", error);
//         }
//     };
//     const data: Promise<[Article]> = loadArticles()
//     const placesData = await data
//     return placesData.map( article => ({
//         placeUrl: article.url,
//         lastModified: article.createdAt
//     }))
// }

export async function getServerSideProps() {
    const pages = await sitemap();
    return {
        props: {
            pages,
        },
    };
}