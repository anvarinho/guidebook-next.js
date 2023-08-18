import getAllPlaces from '@/lib/getAllPlaces'
import { i18n } from '@/lib/i18n.config';

const URL = "https://central-asia.live";
 
export default async function sitemap() {
    const languages = i18n.locales;
    const placesData = await generateStaticParamsPlaces();
    const routes = ["", "/places", "/tours", "/about", "/contact"];
    const currentDate = new Date().toISOString();
    
    const pages = [];

    for (const lang of languages) {
        for (const route of routes) {
            pages.push({
                url: `${URL}/${lang}${route}`,
                lastModified: currentDate,
            });
        }

        for (const placeItem of placesData) {
            pages.push({
                url: `${URL}/${lang}/places/${placeItem.placeUrl}`,
                lastModified: placeItem.lastModified,
            });
        }
    }

    return pages;
}

export async function generateStaticParamsPlaces(){
    const data: Promise<Places> = getAllPlaces()
    const placesData = await data
    return placesData.places.map( placeItem => ({
        placeUrl: placeItem.place.url,
        lastModified: placeItem.place.created
    }))
}