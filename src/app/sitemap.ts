import getAllPlaces from '@/lib/getAllPlaces'

const URL = "https://central-asia.live";
 
export default async function sitemap() {
    const placesData = await generateStaticParamsPlaces()

    const places = placesData.map((item, i)=> ({
        url: `${URL}/places/${item.placeUrl}`,
        lastModified: item.lastModified,
    }))
 
    const routes = ["", "/places", "/tours", "/about", "/contact",].map((route) => ({
        url: `${URL}${route}`,
        lastModified: new Date().toISOString(),
    }));
 
    return [...routes, ...places];
}

export async function generateStaticParamsPlaces(){
    const data: Promise<Places> = getAllPlaces()
    const placesData = await data
    
    return placesData.places.map( placeItem => ({
        placeUrl: placeItem.place.url,
        lastModified: placeItem.place.created
    }))
}