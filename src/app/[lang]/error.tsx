'use client'

import ServicePage from './ServicePageLazy'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ServicePage state="error" reset={reset} />
}
