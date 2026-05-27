import ProductCard from "../components/ProductCard";
import type { Product } from "../types";

export default function MyFavoriteProducts() {
  const myFavorites: Product[] = JSON.parse(
    localStorage.getItem("myFavorites") ?? "[]",
  );

  return (
    <div>
      {myFavorites.map((product) => (
        <ProductCard
          key={product.code}
          product={product}
        />
      ))}
    </div>
  );
}
