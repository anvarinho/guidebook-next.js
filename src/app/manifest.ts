import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GuideBook of Kyrgyzstan',
    short_name: 'GuideBook',
    description: 'Travel guide to the places, tours and culture of Kyrgyzstan.',
    start_url: '/en',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1b3e32',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
