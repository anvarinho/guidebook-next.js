// import { updateProduct } from "@/app/lib/actions";
import { readTour } from "../../lib/data";
import styles from "../../places/[url]/place.module.css";
import Image from "next/image";


  

const SinglePlacePage = async ({ params }) => {
  const { url } = params;
  const product = await readTour(url);

  if (!product) {
    return <div>Loading...</div>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
            {product.title}
            <Image
                src={"http://127.0.0.1:4000/" + product.images[0] || "/noproduct.jpg"}
                alt=""
                fill objectFit="contain"/>
        </div>
      </div>
      <div className={styles.formContainer}>
        <form className={styles.form}>
          <input type="hidden" name="id" value={product._id} />
          <label>Title</label>
          <input type="text" name="title" placeholder={product.title} />
          <label>Region</label>
          <input type="text" name="region" placeholder={product.keywords} />
          <label>Keywords</label>
          <textarea
            type="text"
            name="size"
            placeholder={product.keywords}
          />
          <label>Description</label>
          <textarea
            name="desc"
            id="desc"
            rows="10"
            placeholder={product.description}
          ></textarea>
          <button>Update</button>
        </form>
      </div>
    </div>
  );
};

export default SinglePlacePage;