export const metadata = {
  title: 'Privacy Policy',
  description: 'GuideBook of Kyrgyzstan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  )
}
