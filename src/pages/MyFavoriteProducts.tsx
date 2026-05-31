import ProductCard from "../components/ProductCard";
import { Heart } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";

export default function MyFavoriteProducts() {
  const { favorites: myFavorites } = useFavorites();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-text">Favorites</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Products you've saved for quick access.
        </p>
      </div>

      {/* Conditional rendering: Show empty state or product grid */}
      {myFavorites.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-surface py-12 text-center">
          <div className="rounded-full bg-primary-light p-3">
            <Heart className="size-6 text-primary" />
          </div>
          <p className="text-sm font-medium text-text">No favorites yet</p>
          <p className="text-sm text-text-secondary">
            Tap the button on any product to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {/* Render ProductCard for each favorite product */}
          {myFavorites.map((product) => (
            <ProductCard
              key={product.code}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
}
