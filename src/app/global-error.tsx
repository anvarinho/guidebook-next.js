'use client'

import './[lang]/globals.css'

// Last-resort page when the root layout itself fails (for example stale assets after a deploy).
// Deliberately self-contained: no translations and no extra chunks that could fail to load too.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem', textAlign: 'center' }}>
          <div>
            <h1>Something went wrong</h1>
            <p>Please try again, or return to the home page.</p>
            <p>
              <button type="button" onClick={reset}>Try again</button>{' '}
              {/* A full page load is intended here: the router is unavailable when the app has failed. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/en">Home</a>
            </p>
          </div>
        </main>
      </body>
    </html>
  )
}
