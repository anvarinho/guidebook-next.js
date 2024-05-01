import { readArticles } from "../lib/data";
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
  const { count, places } = await readArticles();

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
            <td>Title:</td>
            <td>Views:</td>
            <td>Created At:</td>
            <td>Actions:</td>
          </tr>
        </thead>
        <tbody>
          {places.map((product, index) => (
            <tr key={product._id}>
              <td>{index + 1}</td>
              <td>
                <div className={styles.product}>
                  <Image
                    src={`${process.env.NEXT_PUBLIC_URL}` + (product.image || product.paragraphs[0].image) || "/noproduct.jpg"}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.productImage}
                  />
                </div>
              </td>
              <td>{product.title['en']}</td>
              <td>{product.viewCount}</td>
              <td>{product.createdAt?.toString().slice(4, 16)}</td>
              <td>
                <div className={styles.buttons}>
                  <Link href={`/admin/articles/${product.url}`}>
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