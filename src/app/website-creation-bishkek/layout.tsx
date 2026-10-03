export const metadata = {
  title: 'Создание Сайтов в Бишкеке',
  description: 'Разработка веб-сайтов и мобильных приложений. Полный спектр услуг: создание, продвижение, разработка под iOS и Android. Качественно, недорого, в срок. Контакты: anvarinho@gmail.com.',
}

import '../jura.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="font-jura">
      <head>
        <link rel="shortcut icon" href="/favicon.png" sizes="any" />
      </head>
      {children}
    </html>
  )
}