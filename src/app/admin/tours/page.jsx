import { readTours } from "../lib/data";
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
  const { count, places } = await readTours(q, page);

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
            <td>Image:</td>
            <td>Title:</td>
            <td>Days:</td>
            <td>Views:</td>
            <td>ID:</td>
            <td>Level:</td>
            
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {places.map((product) => (
            <tr key={product._id}>
              <td>
                <div className={styles.product}>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_URL}` + product.images[0] || "/noproduct.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                </div>
              </td>
              <td>{product.title}</td>
              <td>{product.days.length}</td>
              <td>{product.viewCount}</td>
              <td>{product._id}</td>
              <td>{product.level}</td>
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
      {(count < 20) && (
        <Pagination count={count} />
      )}
    </div>
  );
};

export default ProductsPage;