'use client'

import dynamic from 'next/dynamic'

// ServicePage carries the error / not-found text for every language (~90 KB of JSON).
// Import it through this wrapper so that text is fetched only when an error or a
// not-found page is actually shown, not with every page.
const ServicePageLazy = dynamic(() => import('./ServicePage'), {
  loading: () => <p role="status" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>…</p>,
})

export default ServicePageLazy
