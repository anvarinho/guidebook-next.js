import { Locale } from '@/lib/i18n.config'
import getTour from '@/lib/getTour'

type Params = {
    params: {
        tourUrl: string,
        lang: Locale
    }
}

export default async function Tour({ params: {tourUrl, lang}}: Params) {
    const tourData: Promise<TourData> = getTour(tourUrl)
    const data = await tourData
    return (
        <div>
            <h1>{data.tour.name}</h1>
            <h4>{data.tour.description}</h4>
        </div>
    )
}
