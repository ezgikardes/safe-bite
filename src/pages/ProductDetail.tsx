import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import type { Product } from "../types";
import { triggers } from "../constants/triggers";
import { getSafetyLevel } from "../utils/getSafetyLevel";
import { useTriggers } from "../hooks/useTriggers";

const nutrientLabels: Record<string, string> = {
  fat: "Fat",
  salt: "Salt",
  sugars: "Sugars",
  "saturated-fat": "Saturated Fat",
};

const levelStyle: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  moderate: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700",
};

export default function ProductDetail() {
  // Extract product ID from URL parameters
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);

  const { triggers: savedTriggers } = useTriggers();

  // Combine predefined triggers with user's custom triggers
  const allTriggers = [...triggers, ...savedTriggers];

  // Check if any trigger ingredients are present in the product's ingredient list
  const foundTriggers = allTriggers.filter((trigger) =>
    product?.ingredients_text_en?.toLowerCase().includes(trigger),
  );

  // Fetch product details from API using the product ID from URL
  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/api/v2/product/${id}`);
      const data = await res.json();
      setProduct(data.product);
    }
    fetchProduct();
  }, [id]);

  if (product === null) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-text-muted">Loading product...</p>
      </div>
    );
  }

  const safetyLevel = getSafetyLevel(product);

  const safetyConfig = {
    safe: {
      icon: ShieldCheck,
      label: "Safe for you",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    caution: {
      icon: ShieldAlert,
      label: "Caution",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    risky: {
      icon: ShieldX,
      label: "Risky for you",
      className: "bg-red-50 text-red-700 border-red-200",
    },
  }[safetyLevel];

  const SafetyIcon = safetyConfig.icon;

  return (
    <div className="space-y-5">
      {/* Product header card */}
      <div className="grid grid-cols-[200px_1fr] gap-6 rounded-2xl border border-border bg-surface p-6 shadow-card">
        {product.image_front_url ? (
          <img
            src={product.image_front_url}
            alt={product.product_name}
            className="w-full aspect-square rounded-xl object-contain bg-background"
          />
        ) : (
          <div className="w-full aspect-square rounded-xl bg-background flex items-center justify-center text-text-muted text-xs">
            No image
          </div>
        )}
        <div className="flex flex-col justify-center gap-3 min-w-0">
          <p className="text-xs text-text-muted uppercase tracking-wide font-medium">
            {product.brands ?? "Unknown brand"}
          </p>
          <h1 className="text-2xl font-bold text-text leading-snug">
            {product.product_name ?? "Unnamed product"}
          </h1>
          {/* Safety badge */}
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${safetyConfig.className}`}>
            <SafetyIcon className="size-4" />
            {safetyConfig.label}
          </span>
        </div>
      </div>

      {/* Trigger warning */}
      {foundTriggers.length > 0 && (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Contains your trigger ingredients
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {foundTriggers.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Nutrient levels */}
      {product.nutrient_levels && (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
          <h2 className="mb-3 text-sm font-semibold text-text">
            Nutrient Levels
          </h2>
          <div className="space-y-2">
            {Object.entries(product.nutrient_levels).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  {nutrientLabels[key] ?? key}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${levelStyle[value] ?? "bg-background text-text-muted"}`}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {product.ingredients_text_en && (
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
          <h2 className="mb-2 text-sm font-semibold text-text">Ingredients</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {product.ingredients_text_en}
          </p>
        </div>
      )}
    </div>
  );
}
