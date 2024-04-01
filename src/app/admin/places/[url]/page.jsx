// import { updateProduct } from "@/app/lib/actions";
import { readPlace } from "../../lib/data";
import styles from "./place.module.css";
import Image from "next/image";

const SinglePlacePage = async ({ params }) => {
  const { url } = params;
  const product = await readPlace(url);

  if (!product) {
    return <div>Loading...</div>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
            {product.name["en"]}
            {product.images.map((image) =>{
                {image}
            })}
            <Image
                src={"http://127.0.0.1:4000/" + product.images[0] || "/noproduct.jpg"}
                alt=""
                fill objectFit="contain"/>
        </div>
      </div>
      <div className={styles.formContainer}>
        <form className={styles.form}>
          <input type="hidden" name="id" value={product._id} />
          <label>Name</label>
          <input type="text" name="name" placeholder={product.name["en"]} />
          <label>Title</label>
          <input type="text" name="title" placeholder={product.title["en"]} />
          <label>Region</label>
          <input type="text" name="region" placeholder={product.region["en"]} />
          <label>Keywords</label>
          <textarea
            type="text"
            name="size"
            placeholder={product.keywords["en"]}
          />
          {/* <input type="text" name="keywords" placeholder={product.keywords["en"]} /> */}
          {/* <input
            type="text"
            name="color"
            placeholder={product.color || "color"}
          /> */}
          {/* <label>Size</label>
          <textarea
            type="text"
            name="size"
            placeholder={product.size || "size"}
          />
          <label>Cat</label>
          <select name="cat" id="cat">
            <option value="kitchen">Kitchen</option>
            <option value="computers">Computers</option>
          </select> */}
          <label>Description</label>
          <textarea
            name="desc"
            id="desc"
            rows="10"
            placeholder={product.description["en"]}
          ></textarea>
          <button>Update</button>
        </form>
      </div>
    </div>
  );
};

export default SinglePlacePage;