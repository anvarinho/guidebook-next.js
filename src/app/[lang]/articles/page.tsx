import ArrowIcon from '@/components/ArrowIcon';
import { siteUrl, absoluteSiteUrl, localizedPageAlternates } from "@/lib/seo";
import styles from './articles.module.css';
import shared from '../places/page.module.css';
import { Metadata } from 'next';
import { Locale } from '@/lib/i18n.config';
import { getDictionary } from '@/lib/dictionary';
import getAllArticles from '@/lib/getAllArticles';
import ArticleListItem from './components/ArticleListItem';
import { Suspense } from 'react';
import LoadingSpinner from '../Components/LoadingSpinner';
import { PlacesReveal } from '../places/components/PlacesMotion';
import Meta from './meta';

export default async function Articles(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;

  const {
    lang
  } = params;

  const [{ page }, articles] = await Promise.all([getDictionary(lang), getAllArticles(lang)]);
  const featured = articles.length >= 3;

  return (
    <div className={shared.main} dir={lang === 'ae' ? 'rtl' : 'ltr'}>
      <Meta articles={articles} lang={lang} page={page}/>
      <header className={`${shared.pageIntro} ${styles.intro}`}>
        <PlacesReveal className={shared.introTitle}>
          <p className={shared.eyebrow}>{page.articles.name}</p>
          <h1>{page.articles.title}</h1>
        </PlacesReveal>
        <PlacesReveal className={shared.introAside} order={1}>
          <p className={shared.description}>{page.articles.description}</p>
          <a href="#articles" className={shared.exploreLink}>{page.articles.name}<span aria-hidden="true"><ArrowIcon direction="down"/></span></a>
        </PlacesReveal>
      </header>
      <Suspense fallback={<LoadingSpinner text={page.loading}/>}>
        <section id="articles" className={shared.featuredSection} aria-label={page.articles.name}>
          {featured && <div className={`${shared.featuredGrid} ${styles.featuredGrid}`}>
            {articles.slice(0, 3).map((article, i) => <ArticleListItem key={article._id} article={article} lang={lang} featured order={i}/>)}
          </div>}
          {articles.length > 3 && <PlacesReveal className={shared.collectionHeading}>
            <h2>{page.articles.name}</h2>
            <span className={shared.collectionLine} aria-hidden="true"/>
            <span aria-hidden="true"><ArrowIcon direction="down-left"/></span>
          </PlacesReveal>}
          <div className={shared.placesList}>
            {articles.slice(featured ? 3 : 0).map((article, i) => <ArticleListItem key={article._id} article={article} lang={lang} order={i}/>)}
          </div>
        </section>
      </Suspense>
    </div>
  );
}

export async function generateMetadata(
  props: {
    params: Promise<{lang : Locale}>
  }
): Promise<Metadata> {
  const params = await props.params;

  const {
    lang
  } = params;

  const { page } = await getDictionary(lang)
  return {
      title: {
        absolute: page.articles.title
      },
      description: page.articles.description,
      keywords: page.articles.keywords,
      applicationName:"GuideBook of Kyrgyzstan",
      category: "Travel",
      openGraph:{
        title:page.articles.title,
        description: page.articles.description,
        url: absoluteSiteUrl(`${lang}/articles`),
        siteName: 'GuideBook of Kyrgyzstan',
        images: {
            url: `${siteUrl}/uploads/alakul.jpg`,
            secureUrl: `${siteUrl}/uploads/alakul.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake",
            type:"image/jpeg"
        },
        locale: page.langCode.replace("-",'_'),
        type: 'website',
      },
      twitter: {
        card: "summary_large_image",
        title: page.articles.title,
        description: page.articles.description,
        siteId: "",
        creator: "@anvarinho",
        creatorId: "@anvarinho",
        images: {
            url: `${siteUrl}/uploads/alakul.jpg`,
            width: 800,
            height: 600,
            alt: "Kel-Suu Lake"
        }
      },
      appLinks: {
        ios: {
          url: "https://apps.apple.com/us/app/guidebook-kyrgyzstan/id1575382810",
          app_store_id: "id1575382810",
          app_name: "GuideBook of Kyrgyzstan"
        },
        android: {
          url: "https://play.google.com/store/apps/details?id=com.anvarinho.guidebook",
          package: "com.anvarinho.guidebook",
          app_name: "GuideBook of Kyrgyzstan"
        },
        web: {
          url: absoluteSiteUrl(`${lang}/articles`),
          should_fallback: true,
        }
      },
      alternates: {
        canonical: `${siteUrl}/${lang}/articles/`,
        languages: localizedPageAlternates("articles")
    },
  }
}
