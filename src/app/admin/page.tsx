import { cards } from "./lib/data";
import Card from './ui/dashboard/card/card'
import Rightbar from './ui/dashboard/rightbar/rightbar'
// import Chart from "./ui/dashboard/chart/chart";
import styles from './dashboard.module.css'


export default async function Home() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        <div className={styles.cards}>
          
          {cards.map((item) => (
            <Card item={item} key={item.id} />
          ))}
        </div>
        {/* <h1>{token}</h1> */}
        {/* <Transactions /> */}
        {/* <Chart /> */}
      </div>
      <div className={styles.side}>
        <Rightbar />
      </div>
    </div>
  )
}

// export default function Page() {
//   const cookieStore = cookies()
//   return cookieStore.getAll().map((cookie) => (
//     <div key={cookie.name}>
//       <p>Name: {cookie.name}</p>
//       <p>Value: {cookie.value}</p>
//     </div>
//   ))
// }
