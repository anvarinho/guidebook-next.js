import { isRtlLocale } from '@/lib/localeMetadata';
import getBase64 from '@/lib/getLocalBase64';
import getBlurredDataUrls from '@/lib/getBlurredDataUrls';
import ArrowIcon from '@/components/ArrowIcon';
import styles from '../page.module.css';
import { Suspense } from 'react';
import { getPlacesByURLs, getPlacesByRegion } from '@/lib/getAllPlaces';
import { GoogleMapsEmbed, YouTubeEmbed } from '@next/third-parties/google';
import type { Locale } from '@/lib/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import Link from 'next/link';
import PlaceDescription from './PlaceDescription';
import PlaceGallery from './PlaceGallery';
import PlaceWeather from './PlaceWeather';
import PlaceCard from '../../components/PlaceCard';
import ViewportMap from './ViewportMap';
import SectionProgress from '../../../Components/SectionProgress';
import { destinationGuides } from '../../../manas-airport-transfers/content';
import { getTransferMessages } from '../../../manas-airport-transfers/translations/load';

export default async function PlaceArticle({ promise, lang }: {
  promise: Promise<Place>; lang: Locale;
}) {
  const { page } = await getDictionary(lang);
  const place = await promise;
  const [regionResults, sightResults] = await Promise.all([
    getPlacesByRegion(lang, place.region, place.url),
    place.sights?.length ? getPlacesByURLs(lang, place.sights) : Promise.resolve([]),
  ]);
  const places = regionResults ?? [];
  const sights: PlaceAlias[] = sightResults ?? [];
  const created = place.created ? new Date(place.created) : null;
  const createdDate = created && !Number.isNaN(created.getTime()) ? created : null;
  const transferGuide = destinationGuides.find(guide => guide.slug === place.url);
  const transferMessages = transferGuide ? await getTransferMessages(lang) : null;
  const coordinates = `${place.location.latitude},${place.location.longitude}`;
  const mapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  return (
    <article data-place-page className={styles.main} dir={isRtlLocale(lang) ? 'rtl' : 'ltr'}>
      <div className={styles.breadcrumbMotion}>
        <nav className={styles.breadcrumb} aria-label={page.sights.name}>
          <Link href={`/${lang}/places`}><span aria-hidden="true"><ArrowIcon direction="left"/></span> {page.sights.name}</Link>
          <span aria-hidden="true">/</span>
          <span>{place.region}</span>
        </nav>
      </div>
      <header className={styles.articleHeader} data-motion="float">
        <div>
        <h1 data-motion="swell">{place.title}</h1>
        <div className={styles.info}>
          {createdDate && <time dateTime={createdDate.toISOString()}>
            {page.info.created}{createdDate.toLocaleDateString(page.langCode, { day: 'numeric', month: 'long', year: 'numeric' })}
          </time>}
          <span>{page.info.seen}{Math.floor(place.viewCount).toLocaleString(page.langCode)}</span>
        </div>
        </div>
      </header>
      <div data-motion="leave">
        <PlaceGallery key={`${place.url}:${lang}`} blurDataURLs={getBlurredDataUrls(place.images)} images={place.images} name={place.name} lang={lang} detail/>
      </div>

      <div className={styles.articleLayout} data-motion="takeover">
        <div className={styles.articleBody} id="place-article-body" data-section data-section-label={place.name}>
          <PlaceDescription text={place.description} highlights={page.sights.highlights} name={place.name} lang={lang}/>
          {transferGuide && transferMessages && <p className={styles.airportTransferLink} data-motion="rise">
            <Link href={`/${lang}/manas-airport-transfers?destination=${transferGuide.city}&vehicle=all&sort=featured#providers`}>
              {transferMessages.s217.replace('{destination}', transferMessages[transferGuide.labelKey])}
              <span aria-hidden="true"><ArrowIcon direction="up-right"/></span>
            </Link>
          </p>}
          {place.videoID && <div className={styles.video} data-motion="rise">
            <YouTubeEmbed videoid={place.videoID} width={800}/>
          </div>}
        </div>
        <aside className={styles.locationSidebar} aria-label={`Google Maps — ${place.name}`} data-section data-section-label="Google Maps">
          <Suspense fallback={null}>
            <PlaceWeather url={place.url} lang={lang} language={page.langCode} weather={place.weather}/>
          </Suspense>
          <div className={styles.locationCardMotion} data-motion="rise">
          <section className={styles.locationCard}>
            <div className={styles.locationHeading}>
              <p>{place.region}</p>
              <h2>{place.name}</h2>
            </div>

            <div className={styles.map}>
              {mapsApiKey ? <ViewportMap><GoogleMapsEmbed aria-label={`Google Maps ${place.name}`}
                apiKey={mapsApiKey} height={240} width="100%"
                mode="place" q={coordinates} zoom="12"/></ViewportMap> : <div className={styles.mapPreview}>
                <svg viewBox="0 0 64 64" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M32 56S13 38 13 24a19 19 0 0 1 38 0c0 14-19 32-19 32Z"/>
                  <circle cx="32" cy="24" r="7"/>
                </svg>
                <p dir="ltr">{Number(place.location.latitude).toFixed(4)}, {Number(place.location.longitude).toFixed(4)}</p>
              </div>}
            </div>
            <Link className={styles.mapLink} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(coordinates)}`}
              target="_blank" rel="noopener noreferrer">
              <svg className={styles.mapLinkPin} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>
              </svg>
              <span>Google Maps</span>
              <svg className={styles.mapLinkArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 17 17 7M7 7h10v10"/>
              </svg>
            </Link>
          </section>
          </div>
        </aside>
      </div>

      {sights.length > 0 && <section className={styles.related} aria-labelledby="local-sights-title" data-section>
        <div className={styles.relatedHeading} data-motion="rise"><h2 id="local-sights-title">{place.name}: {page.sights.sights}</h2></div>
        <div className={styles.relatedGrid}>
          {sights.map((sight, index) => <div className={styles.relatedItem} key={sight._id}>
            <PlaceCard blurDataURL={getBase64(sight.images[0])} place={sight} lang={lang} detailPage order={index}/>
            {sight.description && <div data-motion="rise"><p className={styles.relatedSummary}>{sight.description}</p></div>}
          </div>)}
        </div>
      </section>}
      {places.length > 0 && <section className={styles.related} aria-labelledby="region-sights-title" data-section>
        <div className={styles.relatedHeading} data-motion="rise"><h2 id="region-sights-title">{place.region}: {page.sights.sights}</h2></div>
        <div className={styles.relatedGrid}>
          {places.map((sight, index) => <PlaceCard blurDataURL={getBase64(sight.images[0])} key={sight.url} place={sight} lang={lang} detailPage order={index}/>)}
        </div>
      </section>}
      <SectionProgress lang={lang} dir={isRtlLocale(lang) ? 'rtl' : 'ltr'}/>
    </article>
  );
}
