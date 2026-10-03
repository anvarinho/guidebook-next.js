'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import type { Locale } from '@/lib/i18n.config'
import styles from './page.module.css'
import PlaceCard from './components/PlaceCard'

const labels: Record<Locale, { loading: string; more: string; retry: string; end: string }> = {
  en: { loading: 'Loading places…', more: 'Explore more places', retry: 'Couldn’t load places. Try again', end: 'You’ve explored all our places.' },
  fr: { loading: 'Chargement des lieux…', more: 'Découvrir plus de lieux', retry: 'Chargement impossible. Réessayer', end: 'Vous avez découvert tous nos lieux.' },
  de: { loading: 'Orte werden geladen…', more: 'Weitere Orte entdecken', retry: 'Laden fehlgeschlagen. Erneut versuchen', end: 'Sie haben alle unsere Orte entdeckt.' },
  es: { loading: 'Cargando lugares…', more: 'Explorar más lugares', retry: 'No se pudieron cargar. Reintentar', end: 'Has explorado todos nuestros lugares.' },
  it: { loading: 'Caricamento dei luoghi…', more: 'Scopri altri luoghi', retry: 'Caricamento non riuscito. Riprova', end: 'Hai esplorato tutti i nostri luoghi.' },
  ru: { loading: 'Загружаем места…', more: 'Открыть больше мест', retry: 'Не удалось загрузить. Повторить', end: 'Вы просмотрели все наши места.' },
  ae: { loading: 'جارٍ تحميل الأماكن…', more: 'اكتشف المزيد من الأماكن', retry: 'تعذر التحميل. حاول مجدداً', end: 'لقد استكشفت جميع الأماكن لدينا.' },
  cn: { loading: '正在加载景点…', more: '探索更多景点', retry: '加载失败，重试', end: '你已浏览所有景点。' },
  jp: { loading: 'スポットを読み込み中…', more: 'もっとスポットを見る', retry: '読み込めませんでした。再試行', end: 'すべてのスポットをご覧いただきました。' },
  kr: { loading: '장소를 불러오는 중…', more: '더 많은 장소 보기', retry: '불러오지 못했습니다. 다시 시도', end: '모든 장소를 둘러보셨습니다.' },
}

export function LoadMore({ lang, initialIds }: { lang: Locale; initialIds: string[] }) {
  const [places, setPlaces] = useState<(PlaceAlias & { blurDataURL?: string })[]>([])
  const [offset, setOffset] = useState(initialIds.length)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialIds.length >= 12)
  const [failed, setFailed] = useState(false)
  const busy = useRef(false)
  const seen = useRef(new Set(initialIds))
  const controller = useRef<AbortController | null>(null)
  const { ref, inView } = useInView({ rootMargin: '300px' })
  const copy = labels[lang]

  const load = useCallback(async () => {
    if (busy.current || !hasMore) return
    busy.current = true
    const request = new AbortController()
    controller.current = request
    setLoading(true)
    setFailed(false)
    try {
      const response = await fetch(`/api/places/more?lang=${lang}&offset=${offset}`, { signal: request.signal })
      if (!response.ok) throw new Error('Could not load places')
      const data = await response.json()
      if (!Array.isArray(data.places)) throw new Error('Invalid places response')
      const next: (PlaceAlias & { blurDataURL?: string })[] = data.places
      const unique = next.filter(place => {
        if (seen.current.has(place._id)) return false
        seen.current.add(place._id)
        return true
      })
      setPlaces(previous => [...previous, ...unique])
      setOffset(previous => previous + next.length)
      setHasMore(next.length === 12 && unique.length > 0)
    } catch {
      if (!request.signal.aborted) setFailed(true)
    } finally {
      busy.current = false
      if (!request.signal.aborted) setLoading(false)
    }
  }, [hasMore, lang, offset])

  const loadRef = useRef(load)
  useEffect(() => { loadRef.current = load }, [load])
  // Load once when the sentinel enters view; changing the offset must not
  // fetch another page before the observer has measured the new cards.
  useEffect(() => { if (inView && !failed) void loadRef.current() }, [inView, failed])
  useEffect(() => () => { controller.current?.abort() }, [])

  return <>
    {places.map((place, index) => <PlaceCard key={place._id} place={place} lang={lang} order={index} blurDataURL={place.blurDataURL}/>)}
    <div className={styles.listStatus} ref={ref} aria-busy={loading}>
      {loading ? <span role="status">{copy.loading}</span> : hasMore ? <button type="button" className={styles.loadButton} onClick={() => void load()}>{failed ? copy.retry : copy.more}</button> : <p role="status">{copy.end}</p>}
    </div>
  </>
}
