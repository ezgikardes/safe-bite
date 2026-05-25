import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Product } from "../types";
import { triggers } from "../constants/triggers";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const customTriggers: string[] = JSON.parse(
    localStorage.getItem("myTriggers") ?? "[]",
  );

  const allTriggers = [...triggers, ...customTriggers];

  const foundTriggers = allTriggers.filter((trigger) =>
    product?.ingredients_text_en?.toLowerCase().includes(trigger),
  );

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/api/v2/product/${id}`);
      const data = await res.json();
      setProduct(data.product);
    }
    fetchProduct();
  }, [id]);

  return (
    <>
      {product === null ? (
        <p>Loading...</p>
      ) : (
        <div>
          <img src={product.image_front_url} />
          <p>{product.product_name}</p>
          <p>{product.brands}</p>
          {product.ingredients_text_en && (
            <p> This product contains: {foundTriggers.join(", ")} </p>
          )}
        </div>
      )}
    </>
  );
}
