import { readUsers } from "../lib/data";
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
  const { count, places } = await readUsers();

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Search placeholder="Search for a product..." />
        <Link href="/admin/users/add">
          <button className={styles.addButton}>Add New</button>
        </Link>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <td>Image:</td>
            <td>Username:</td>
            <td>Email:</td>
            <td>Phone:</td>
            <td>Is Active:</td>
            <td>Is Admin:</td>
            <td>Bio:</td>
            <td>Actions:</td>
          </tr>
        </thead>
        <tbody>
          {places.map((product) => (
            <tr key={product._id}>
              <td>
                <div className={styles.product}>
                  <Image
                    src={"/avatar.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                  {/* <p>{product.username}</p> */}
                </div>
              </td>
              <td>{product.username}</td>
              <td>{product.email}</td>
              <td>{product.phone}</td>
              <td>{product.isActive ? <p style={{ color: 'green' }}>&#10004;</p> : <p style={{ color: 'red' }}>&#10006;</p>}</td>
              <td>{product.isAdmin ? <p style={{ color: 'green' }}>&#10004;</p> : <p style={{ color: 'red' }}>&#10006;</p>}</td>
              <td>{product.address}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/admin/users/${product._id}`}>
                    <button className={`${styles.button} ${styles.view}`}>
                      View
                    </button>
                  </Link>
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