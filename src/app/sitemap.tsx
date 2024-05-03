import { MetadataRoute } from 'next'
import { i18n } from '@/lib/i18n.config';
import { sitemapPlaces } from '@/lib/getAllPlaces';
import { sitemapArticles } from '@/lib/getAllArticles';
import { sitemapTours } from '@/lib/getAllTours';
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap>  {
    const URL = "https://central-asia.live";
    const languages = i18n.locales;
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
                changeFrequency: 'weekly' as const,
                priority: 0.8
            });
        }
        for (const place of places) {
            // console.log(`${placeItem.lastModified}:  ${placeItem.placeUrl}`)
            pages.push({
                url: `${URL}/${lang}/places/${place.placeUrl}`,
                lastModified: place.lastModified,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
                // alternates:{
                //     languages: {
                //         en:""
                //     }
                // }
            });
        }
        for (const article of articles) {
            const isoString = new Date(article.lastModified).toISOString()
            pages.push({
                url: `${URL}/${lang}/articles/${article.placeUrl}`,
                lastModified: isoString,
                changeFrequency: 'weekly' as const,
                priority: 0.9
            });
        }
        for (const tour of tours) {
            pages.push({
                url: `${URL}/${lang}/tours/${tour.tourUrl}`,
                lastModified: "2024-04-04T19:51:29.199Z",
                changeFrequency: 'weekly' as const,
                priority: 1
            });
        }
    }
    return pages;
}

// export async function getServerSideProps() {
//     const pages = await sitemap();
//     return {
//         props: {
//             pages,
//         },
//     };
// }