import { triggers } from "../constants/triggers";
import type { Product } from "../types";

export function getSafetyLevel(product: Product): "safe" | "caution" | "risky" {
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
