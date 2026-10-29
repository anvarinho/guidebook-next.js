import './globals.css'

export const metadata = {
  robots: { index: false, follow: false },
  title: 'Admin login | GuideBook',
  description: 'Sign in to GuideBook administration.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
