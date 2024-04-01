import { readStats } from "../lib/data";
import Image from "next/image";
import Link from "next/link";
import styles from "../places/places.module.css";
import Search from "../ui/dashboard/search/search";
import Pagination from "../ui/dashboard/pagination/pagination";
// import { fetchProducts } from "@/app/lib/data";
// import { deleteProduct } from "@/app/lib/actions";

const ProductsPage = async ({ searchParams }) => {
  const q = searchParams?.q || "";
  const page = searchParams?.page || 1;
  // const { count, products } = await fetchProducts(q, page);
  const { count, places } = await readStats(q, page);

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
            <td>TimeStamp:</td>
            <td>Host:</td>
            <td>Route:</td>
            <td>Status:</td>
            <td>Language:</td>
            <td>UserAgent</td>
          </tr>
        </thead>
        <tbody>
          {places.map((product) => (
            <tr key={product._id}>
              <td>
                <div className={styles.product}>
                  {product.timestamp?.toString().slice(4, 24)}
                </div>
              </td>
              <td>{product.ip}</td>
              <td>{product.route}</td>
              <td>{product.statusCode}</td>
              <td>{product.lang}</td>
              <td>{product.userAgent.toString().slice(0, 11)}</td>
              {/* <td>{product.query["lang"] || ""}</td> */}
              <td>
                <div className={styles.buttons}>
                  <Link href={`/admin/tours/${product.url}`}>
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