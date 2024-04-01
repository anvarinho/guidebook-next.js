import Navbar from "./ui/dashboard/navbar/navbar"
import Sidebar from "./ui/dashboard/sidebar/sidebar"
import styles from './dashboard.module.css'
import Footer from "./ui/dashboard/footer/footer"
import './globals.css'
import { redirect } from 'next/navigation'
// import { cookies } from 'next/headers'
import { isAuthenticatedAdmin } from "@/lib/auth"


export const metadata = {
  title: 'Admin Dashboard',
  description: 'GuideBook of Kyrgyzstan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = isAuthenticatedAdmin()
  if(!isAdmin){
    console.log(isAdmin)
    console.log("is not an admin")
    redirect('/login')
  }
  return (
    <html lang="en">
      <body>
        <div className={styles.container}>
          <div className={styles.menu}>
            <Sidebar/>
          </div>
          <div className={styles.content}>
            <Navbar/>
            {children}
            <Footer/>  
          </div>
        </div>
        </body>
    </html>
  )
}
