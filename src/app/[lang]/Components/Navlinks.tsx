import styles from './page.module.css'
import { Locale } from '../../../lib/i18n.config';

export default function Navlinks({
    params: {lang}
  }: {
    params: {lang : Locale}
  }) {
    const navLinks = [
        { text: 'Home', url: `${lang}/` },
        { text: 'Sights', url: `${lang}/places` },
        { text: 'Tours', url: `${lang}/tours` },
        { text: 'About', url: `${lang}/about` },
        { text: 'Contact', url:  `${lang}/contact` },
      ];
  return (
    
    <>
    {navLinks.map((link) => {

    })}
        
    </>
  )
}