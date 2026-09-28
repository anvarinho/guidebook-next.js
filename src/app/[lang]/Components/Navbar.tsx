import { Locale } from '@/lib/i18n.config'
import { getDictionary } from '@/lib/dictionary'
import Navigation from './Navigation'

export default async function Navbar ({ lang }: { lang: Locale }) {
    const { page } = await getDictionary(lang)
    return <Navigation lang={lang} name={page.name} links={page.navigation} contactLabel={page.about.buttons.contact_us}/>
}
