'use client'

import ServicePage from './[lang]/ServicePage'
import './[lang]/globals.css'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><ServicePage state="error" reset={reset} /></body></html>
}
