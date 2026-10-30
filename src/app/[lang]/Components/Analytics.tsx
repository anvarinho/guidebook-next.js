import Script from 'next/script';

export default function Analytics({ id }: { id: string }) {
  const encodedId = JSON.stringify(id).replace(/</g, '\\u003c');
  return <>
    <Script id="guidebook-analytics-init" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ${encodedId});
    `}</Script>
    <Script id="guidebook-analytics" strategy="lazyOnload"
      src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`} />
  </>;
}
