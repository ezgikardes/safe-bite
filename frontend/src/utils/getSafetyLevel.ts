import type { Product } from "../types";

export function getSafetyLevel(product: Product): "safe" | "risky" {
  const customTriggers: string[] = JSON.parse(
    localStorage.getItem("myTriggers") ?? "[]",
  );

  const hasTrigger = customTriggers.some((trigger) =>
    product.ingredients_text_en?.toLowerCase().includes(trigger),
  );

  return hasTrigger ? "risky" : "safe";
}
