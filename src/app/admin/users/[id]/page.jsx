// import { updateProduct } from "@/app/lib/actions";
import { readUser } from "../../lib/data";
import styles from "../../places/[url]/place.module.css";
import Image from "next/image";


  

const SinglePlacePage = async ({ params }) => {
  const { id } = params;
  const product = await readUser(id);

  if (!product) {
    return <div>Loading...</div>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
            <Image
                src={"/avatar.jpg"}
                alt=""
                fill objectFit="contain"/>
        </div>
      </div>
      <div className={styles.formContainer}>
        <form className={styles.form}>
          <input type="hidden" name="id" value={product._id} />
          <label>Username</label>
          <input type="text" name="name" placeholder={product.username} />
          <label>ID</label>
          <input type="text" name="title" placeholder={product._id} />
          <label>Email</label>
          <input type="text" name="name" placeholder={product.email} />
          <label>Password</label>
          <input type="text" name="region" placeholder={product.password} />
          <button>Update</button>
        </form>
      </div>
    </div>
  );
};

export default SinglePlacePage;