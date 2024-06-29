export const metadata = {
  title: 'Создание Сайтов в Бишкеке',
  description: 'Разработка веб-сайтов и мобильных приложений. Полный спектр услуг: создание, продвижение, разработка под iOS и Android. Качественно, недорого, в срок. Контакты: anvarinho@gmail.com.',
}

import { Jura } from 'next/font/google'
const font = Jura({weight: ['300','400','500','600','700'],style: 'normal', subsets: ['latin'], display: 'swap' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={font.className}>
      <head>
        <link rel="shortcut icon" href="/favicon.png" sizes="any" />
      </head>
      {children}
    </html>
  )
}