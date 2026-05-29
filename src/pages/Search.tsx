import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { type Product } from "../types";
import ProductCard from "../components/ProductCard";
import { Search as SearchIcon, Loader2 } from "lucide-react";

export default function Search() {
  // Get URL search params and extract initial search query if provided
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") ?? "",
  );
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // API function to search products by name using Open Food Facts API
  const searchProductsByName = async (query: string) => {
    const url = `/api/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&fields=code,product_name,brands,image_front_url,ingredients_text_en,nutrient_levels`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Ürünler alınamadı");
    }
    const data = await res.json();
    console.log(data);
    return data;
  };

  // Handle search action - validate input, call API, and manage state
  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchProductsByName(searchQuery);
      setResults(result.products ?? []);
    } catch (err) {
      setError("Product cannot be found");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-text">Search Products</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Search our database of over 100,000 food products.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 focus-within:border-primary transition-colors">
          <SearchIcon className="size-4 text-text-muted shrink-0" />
          {/* Text input - food search on Enter or button click */}
          <input
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            type="text"
            placeholder="Search by brand or product name..."
            value={searchQuery}
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
            autoFocus
          />
        </div>
        {/* Search button - disabled during loading */}
        <button
          onClick={() => handleSearch()}
          disabled={isLoading}
          className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primary-hover transition-colors disabled:opacity-50">
          Search
        </button>
      </div>

      {/* Loading spinner displayed while searching */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Loader2 className="size-4 animate-spin" />
          Searching...
        </div>
      )}

      {/* Error message displayed if search fails */}
      {error !== null && (
        <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
          Something went wrong
        </p>
      )}

      {/* Grid of product results - responsive layout from 2 to 4 columns */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((product) => (
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
