import { useState } from "react";

type Product = {
  code: string;
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  ingredients_text_de?: string;
  ingredients_tags?: string[];
  image_front_url?: string;
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const searchProductsByName = async (query: string) => {
    const url = `/search-api/search?q=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Ürünler alınamadı");
    }
    const data = await res.json();
    console.log(data);
    return data;
  };

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchProductsByName(searchQuery);
      setResults(result.hits);
    } catch (err) {
      setError("Product cannot be found");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <input
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        placeholder=""
        value={searchQuery}></input>
      <button onClick={() => handleSearch()}>Search</button>
      {isLoading && <p>Loading...</p>}
      {error !== null && <p>Something went wrong</p>}
      {results.map((product) => (
        <div key={product.code}>
          <p>{product.product_name}</p>
        </div>
      ))}
    </div>
  );
}
