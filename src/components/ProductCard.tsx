import type { Product } from "../types";
import { Link } from "react-router-dom";
import { getSafetyLevel } from "../utils/getSafetyLevel";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const emojiMap = {
    safe: "🟢 Safe",
    caution: "🟡 Caution",
    risky: "🔴 Risky",
  };

  return (
    <Link to={`/product/${product.code}`}>
      <img src={product.image_front_url} />
      <p>{product.product_name}</p>
      <p>{product.brands}</p>
      <p>
        {product.ingredients_text_en
          ? emojiMap[getSafetyLevel(product)]
          : "⚠️  Ingredients unknown"}
      </p>
    </Link>
  );
}
