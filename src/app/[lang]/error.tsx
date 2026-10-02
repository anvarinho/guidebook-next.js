'use client'

import ServicePage from './ServicePage'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <ServicePage state="error" reset={reset} />
}
