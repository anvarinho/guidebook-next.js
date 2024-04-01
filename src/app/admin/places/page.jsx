import { readPlaces } from "../lib/data";
import Image from "next/image";
import Link from "next/link";
import styles from "./places.module.css";
import Search from "../ui/dashboard/search/search";
import Pagination from "../ui/dashboard/pagination/pagination";
// import { fetchProducts } from "@/app/lib/data";
// import { deleteProduct } from "@/app/lib/actions";

const ProductsPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  // const { count, products } = await fetchProducts(q, page);
  const { count, places } = await readPlaces(q, page);

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a product..." />
        <Link href="/dashboard/products/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Num:</td>
            <td>Image:</td>
            <td>Name:</td>
            <td>Views:</td>
            <td>ID:</td>
            <td>Created At:</td>
            <td>Region:</td>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {places.map((product, index) => (
            <tr key={product._id} className={styles.trow}>
              <td>{index + 1}</td>
              <td>
                <div className={styles.product}>
                  <Image
                    src={"http://127.0.0.1:4000/" + product.images[0] || "/noproduct.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                </div>
              </td>
              <td>{product.name['en']}</td>
              <td>{Math.round(product.viewCount)}</td>
              <td>{product._id}</td>
              <td>{product.created?.toString().slice(4, 16)}</td>
              <td>{product.region['en']}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/admin/places/${product.url}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
                  {/* <form action={deleteProduct}>
                    <input type="hidden" name="id" value={product.id} />
                    <button className={`${styles.button} ${styles.delete}`}>
                      Delete
                    </button>
                  </form> */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination count={count} />
    </div>
  );
};

export default ProductsPage;