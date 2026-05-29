import { triggers } from "../constants/triggers";
import type { Product } from "../types";

// Utility function to determine food safety level for a product
export function getSafetyLevel(product: Product): "safe" | "caution" | "risky" {
  // Retrieve user's custom trigger ingredients from localStorage
  const customTriggers: string[] = JSON.parse(
    localStorage.getItem("myTriggers") ?? "[]",
  );

  // Combine predefined triggers with user's custom triggers
  const allTriggers = [...triggers, ...customTriggers];

  // Check if any trigger ingredient is present in the product's ingredient list
  const hasTrigger = allTriggers.some((trigger) =>
    product.ingredients_text_en?.toLowerCase().includes(trigger),
  );
  // Return "risky" immediately if any trigger is found
  if (hasTrigger) {
    return "risky";
  }
  // Check if product has high levels of unhealthy nutrients
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
