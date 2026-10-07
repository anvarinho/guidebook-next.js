'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { i18n, type Locale } from '@/lib/i18n.config'
import FlagSun from './Components/FlagSun'
import LoadingRing from './Components/LoadingRing'
import styles from './service-page.module.css'

type Copy = {
  notFound: { eyebrow: string; title: string; description: string }
  error: { eyebrow: string; title: string; description: string }
  loading: { eyebrow: string; title: string; description: string }
  home: string
  places: string
  retry: string
}

const copy: Record<Locale, Copy> = {
  en: { notFound: { eyebrow: 'A different route', title: 'Looks like this page went hiking.', description: 'It forgot to leave a trail. Let’s find you somewhere better to explore.' }, error: { eyebrow: 'A brief interruption', title: 'We hit a rough patch.', description: 'Something went wrong while loading this page. Give it another try or continue exploring.' }, loading: { eyebrow: 'Finding your way', title: 'The journey is taking shape.', description: 'We are getting your guide ready.' }, home: 'Back to the guide', places: 'Explore places', retry: 'Try again' },
  ru: { notFound: { eyebrow: 'Другой маршрут', title: 'Эта страница ушла в поход.', description: 'И забыла оставить след. Давайте найдём другое место для прогулки.' }, error: { eyebrow: 'Небольшая остановка', title: 'Что-то пошло не так.', description: 'Не удалось загрузить страницу. Попробуйте ещё раз или продолжите путешествие.' }, loading: { eyebrow: 'Прокладываем маршрут', title: 'Путешествие скоро начнётся.', description: 'Готовим для вас путеводитель.' }, home: 'К путеводителю', places: 'Смотреть места', retry: 'Повторить' },
  fr: { notFound: { eyebrow: 'Un autre itinéraire', title: 'Cette page est partie en randonnée.', description: 'Elle a oublié de laisser des traces. Trouvons un autre endroit à explorer.' }, error: { eyebrow: 'Une courte pause', title: 'Un imprévu sur le chemin.', description: 'Cette page ne s’est pas chargée. Réessayez ou poursuivez votre découverte.' }, loading: { eyebrow: 'En route', title: 'Le voyage prend forme.', description: 'Nous préparons votre guide.' }, home: 'Retour au guide', places: 'Explorer les lieux', retry: 'Réessayer' },
  de: { notFound: { eyebrow: 'Eine andere Route', title: 'Diese Seite ist wandern gegangen.', description: 'Sie hat keine Spur hinterlassen. Finden wir lieber einen anderen Ort zum Entdecken.' }, error: { eyebrow: 'Eine kurze Pause', title: 'Ein Hindernis auf dem Weg.', description: 'Diese Seite konnte nicht geladen werden. Versuche es erneut oder entdecke mehr.' }, loading: { eyebrow: 'Auf dem Weg', title: 'Die Reise nimmt Gestalt an.', description: 'Wir bereiten deinen Reiseführer vor.' }, home: 'Zurück zum Reiseführer', places: 'Orte entdecken', retry: 'Erneut versuchen' },
  es: { notFound: { eyebrow: 'Otra ruta', title: 'Esta página se fue de excursión.', description: 'Olvidó dejar un rastro. Busquemos otro lugar para explorar.' }, error: { eyebrow: 'Una breve pausa', title: 'Un imprevisto en el camino.', description: 'No se pudo cargar esta página. Inténtalo de nuevo o sigue explorando.' }, loading: { eyebrow: 'Preparando el camino', title: 'El viaje está tomando forma.', description: 'Estamos preparando tu guía.' }, home: 'Volver a la guía', places: 'Explorar lugares', retry: 'Intentar de nuevo' },
  it: { notFound: { eyebrow: 'Un altro percorso', title: 'Questa pagina è andata a fare trekking.', description: 'Ha dimenticato di lasciare una traccia. Troviamo un altro posto da esplorare.' }, error: { eyebrow: 'Una breve sosta', title: 'Un imprevisto lungo il percorso.', description: 'Non siamo riusciti a caricare questa pagina. Riprova o continua a esplorare.' }, loading: { eyebrow: 'In viaggio', title: 'Il viaggio prende forma.', description: 'Stiamo preparando la tua guida.' }, home: 'Torna alla guida', places: 'Esplora i luoghi', retry: 'Riprova' },
  ae: { notFound: { eyebrow: 'طريق آخر', title: 'يبدو أن هذه الصفحة خرجت في نزهة.', description: 'ونسيت أن تترك لنا أثرًا. لنجد مكانًا آخر نستكشفه.' }, error: { eyebrow: 'توقف قصير', title: 'واجهنا عثرة في الطريق.', description: 'حدث خطأ أثناء تحميل الصفحة. حاول مرة أخرى أو واصل الاستكشاف.' }, loading: { eyebrow: 'نرسم الطريق', title: 'الرحلة توشك أن تبدأ.', description: 'نجهز دليلك الآن.' }, home: 'العودة إلى الدليل', places: 'استكشف الأماكن', retry: 'حاول مجددًا' },
  cn: { notFound: { eyebrow: '换一条路线', title: '这一页跑去徒步了。', description: '它忘了留下路线。我们换个好地方探索吧。' }, error: { eyebrow: '短暂停留', title: '途中遇到了一点问题。', description: '页面加载失败。请重试，或继续探索。' }, loading: { eyebrow: '正在规划路线', title: '旅程即将开始。', description: '我们正在准备你的旅行指南。' }, home: '返回指南', places: '探索景点', retry: '重试' },
  jp: { notFound: { eyebrow: '別のルートへ', title: 'このページはハイキングに出かけたようです。', description: '道しるべを忘れてしまったようです。別の場所を探しましょう。' }, error: { eyebrow: '少し寄り道', title: '途中で問題が発生しました。', description: 'ページを読み込めませんでした。もう一度お試しになるか、探索を続けてください。' }, loading: { eyebrow: '道を探しています', title: '旅の準備をしています。', description: 'ガイドを準備中です。' }, home: 'ガイドに戻る', places: 'スポットを探す', retry: '再試行' },
  kr: { notFound: { eyebrow: '다른 경로', title: '이 페이지는 하이킹을 떠났나 봐요.', description: '흔적을 남기는 걸 깜빡했네요. 다른 곳을 둘러볼까요?' }, error: { eyebrow: '잠시 쉬어가기', title: '가는 길에 문제가 생겼어요.', description: '페이지를 불러오지 못했어요. 다시 시도하거나 계속 둘러보세요.' }, loading: { eyebrow: '길을 찾는 중', title: '여행을 준비하고 있어요.', description: '여행 안내를 준비 중입니다.' }, home: '가이드로 돌아가기', places: '장소 둘러보기', retry: '다시 시도' },
}

const backLabels: Record<Locale, string> = {
  en: 'Go back', ru: 'Назад', fr: 'Retour', de: 'Zurück', es: 'Volver',
  it: 'Indietro', ae: 'العودة', cn: '返回', jp: '戻る', kr: '뒤로 가기',
}

export default function ServicePage({ state, reset }: { state: 'notFound' | 'error' | 'loading'; reset?: () => void }) {
  const router = useRouter()
  const pathname = usePathname() || ''
  const segment = pathname.split('/')[1]
  const lang: Locale = i18n.locales.includes(segment as Locale) ? segment as Locale : i18n.defaultLocale
  const content = copy[lang]
  const message = content[state]

  if (state === 'loading') {
    return (
      <section className={styles.loadingPage} data-service-state="loading" role="status" aria-live="polite" dir={lang === 'ae' ? 'rtl' : 'ltr'}>
        <FlagSun />
        <LoadingRing large />
      </section>
    )
  }

  const isNotFound = state === 'notFound'
  return (
    <section className={styles.statusPage} data-service-state={state} dir={lang === 'ae' ? 'rtl' : 'ltr'} aria-labelledby="service-title">
      <FlagSun />
      <span className={styles.statusCode} aria-hidden="true">{isNotFound ? '404' : '500'}</span>
      <h1 id="service-title">{message.title}</h1>
      <p>{message.description}</p>
      <div className={styles.statusActions}>
        {isNotFound ? <>
          <Link href={`/${lang}/places`} className={styles.orangeButton}>{content.places}<span aria-hidden="true">↗</span></Link>
          <button type="button" className={styles.darkButton} onClick={() => window.history.length > 1 ? router.back() : router.push(`/${lang}`)}>
            <span aria-hidden="true">{lang === 'ae' ? '→' : '←'}</span>{backLabels[lang]}
          </button>
        </> : <>
          {reset ? <button type="button" className={styles.orangeButton} onClick={reset}>{content.retry}<span aria-hidden="true">↻</span></button>
            : <Link href={`/${lang}`} className={styles.orangeButton}>{content.home}<span aria-hidden="true">↗</span></Link>}
          {reset && <Link href={`/${lang}`} className={styles.darkButton}>{content.home}<span aria-hidden="true">↗</span></Link>}
        </>}
      </div>
    </section>
  )
}
