import styles from "../page.module.css"

type Props = {
    promise: Promise<PlaceData>
}

export default async function Place({ promise }: Props) {
    const baseUrl = 'http://127.0.0.1:4000/';
    const place = await promise
    console.log(place)
    return (
        <article className={styles.main}>
            <h1>{place.place.name}</h1>
            <img src={baseUrl + place.place.image} alt="" />
            <h4>{place.place.title}</h4>
            <br />
            <p>{place.place.description}</p>
        </article>
    )
}
