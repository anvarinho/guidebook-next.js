// import { updateProduct } from "@/app/lib/actions";
import { readArticle } from "../../lib/data";
import styles from "../../places/[url]/place.module.css";
import Image from "next/image";


  

const SinglePlacePage = async ({ params }) => {
  const { url } = params;
  const product = await readArticle(url);

  if (!product) {
    return <div>Loading...</div>;
  }
  return (
    <div className={styles.container}>
      <div className={styles.infoContainer}>
        <div className={styles.imgContainer}>
            {product.title["en"]}
            <Image
                src={"http://127.0.0.1:4000/" + (product.image || product.paragraphs[0].image) || "/noproduct.jpg"}
                alt=""
                fill objectFit="contain"/>
        </div>
      </div>
      <div className={styles.formContainer}>
        <form className={styles.form}>
          <input type="hidden" name="id" value={product._id} />
          <label>Title</label>
          <input type="text" name="name" placeholder={product.title["en"]} />
          <label>Subtitle</label>
          <input type="text" name="title" placeholder={product.subtitle["en"]} />
          <label>Keywords</label>
          <input type="text" name="region" placeholder={product.keywords["en"]} />
          {product.paragraphs.map((paragraph, index) => (
            <div key={index}>
              <label>Paragraph {index + 1}: {paragraph.title["en"]}</label>
              <textarea
                type="text"
                name={`paragraph-${index}`}
                placeholder={paragraph.text["en"]}
              />
            </div>
          ))}
          <button>Update</button>
        </form>
      </div>
    </div>
  );
};

export default SinglePlacePage;