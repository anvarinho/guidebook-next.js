import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n.config';
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap>  {
    const URL = "http://127.0.0.1:3000";
    const languages = i18n.locales;
    // const languages = ['en', 'de', 'fr', 'it', 'es', 'kr', 'jp', 'cn', 'ae', 'ru']
    // const placesData = await generateStaticParamsPlaces();
    // const articlesData = await generateStaticParamsArticles()
    const routes = ["/", "/places", "/tours", "/about", "/articles"];
    const currentDate = new Date().toISOString();
    
    const pages = [];

    for (const lang of languages) {
        for (const route of routes) {
            pages.push({
                url: `${URL}/${lang}${route}`,
                lastModified: currentDate,
            });
        }

        // for (const place of placesData) {
        //     // console.log(`${placeItem.lastModified}:  ${placeItem.placeUrl}`)
        //     pages.push({
        //         url: `${URL}/${lang}/places/${place.placeUrl}`,
        //         lastModified: place.lastModified,
        //     });
        // }
        // for (const article of articlesData) {
        //     // console.log(`${placeItem.lastModified}:  ${placeItem.placeUrl}`)
        //     pages.push({
        //         url: `${URL}/${lang}/articles/${article.placeUrl}`,
        //         lastModified: article.lastModified,
        //     });
        // }
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