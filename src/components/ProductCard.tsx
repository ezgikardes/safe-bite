import type { Product } from "../types";
import { triggers } from "../constants/triggers";

type ProductCardProps = {
  product: Product;
};

function getSafetyLevel(product: Product): "safe" | "caution" | "risky" {
  const hasTrigger = triggers.some((trigger) =>
    product.ingredients_text?.includes(trigger),
  );
  return "risky";
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      <img src={product.image_front_url} />
      <p>{product.product_name}</p>
      <p>{product.brands}</p>
      <p>safety</p>
    </div>
  );
}
