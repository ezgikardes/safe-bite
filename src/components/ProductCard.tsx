import type { Product } from "../types";
import { Link } from "react-router-dom";
import { getSafetyLevel } from "../utils/getSafetyLevel";
import { ImageOff } from "lucide-react";
import { useState } from "react";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const emojiMap = {
    safe: "🟢 Safe",
    caution: "🟡 Caution",
    risky: "🔴 Risky",
  };

  // Retrieve saved favorite products from browser's local storage
  const savedProducts: Product[] = JSON.parse(
    localStorage.getItem("myFavorites") ?? "[]",
  );

  const [isFavorite, setIsFavorite] = useState<boolean>(
    savedProducts.some((p) => p.code === product.code),
  );

  // Toggles a product in the favorites list and updates localStorage
  function toggleFavorite(newProduct: Product) {
    if (savedProducts.some((p) => p.code === newProduct.code)) {
      localStorage.setItem(
        "myFavorites",
        JSON.stringify(savedProducts.filter((p) => p.code !== newProduct.code)),
      );
    } else {
      localStorage.setItem(
        "myFavorites",
        JSON.stringify([...savedProducts, newProduct]),
      );
    }
    setIsFavorite(!isFavorite);
  }

  // State to track if product image failed to load
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/product/${product.code}`}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-card transition-shadow hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-background">
        {!imgError && product.image_front_url ? (
          <img
            src={product.image_front_url}
            alt={product.product_name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <ImageOff className="size-8" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs text-text-muted">{product.brands}</p>
        <p className="text-sm font-semibold text-text line-clamp-2">
          {product.product_name}
        </p>
        <p className="mt-1 text-xs">
          {product.ingredients_text_en
            ? emojiMap[getSafetyLevel(product)]
            : "⚠️ Ingredients unknown"}
        </p>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product);
          }}
          className="mt-2 w-full rounded-lg border border-border py-1.5 text-xs font-medium text-text-secondary hover:bg-background transition-colors">
          {isFavorite ? `Remove from favorites` : `Add to favorites`}
        </button>
      </div>
    </Link>
  );
}
