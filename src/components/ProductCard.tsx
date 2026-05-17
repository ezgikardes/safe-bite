import type { Product } from "../types";
import { triggers } from "../constants/triggers";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const emojiMap = {
    safe: "🟢 Safe",
    caution: "🟡 Caution",
    risky: "🔴 Risky",
  };

  function getSafetyLevel(product: Product): "safe" | "caution" | "risky" {
    const customTriggers: string[] = JSON.parse(
      localStorage.getItem("myTriggers") ?? "[]",
    );

    const allTriggers = [...triggers, ...customTriggers];

    const hasTrigger = allTriggers.some((trigger) =>
      product.ingredients_text_en?.toLowerCase().includes(trigger),
    );
    if (hasTrigger) {
      return "risky";
    }
    if (
      product.nutrient_levels?.fat === "high" ||
      product.nutrient_levels?.salt === "high" ||
      product.nutrient_levels?.sugars === "high" ||
      product.nutrient_levels?.["saturated-fat"] === "high"
    ) {
      return "caution";
    }
    return "safe";
  }

  return (
    <div>
      <img src={product.image_front_url} />
      <p>{product.product_name}</p>
      <p>{product.brands}</p>
      <p>
        {product.ingredients_text_en
          ? emojiMap[getSafetyLevel(product)]
          : "⚠️  Ingredients unknown"}
      </p>
    </div>
  );
}
