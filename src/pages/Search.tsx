import { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${searchQuery}&json=true&page_size=20`,
      );
      const data = await response.json();
      setResults(data.products);
    } catch (err) {
      setError("Bir şeyler ters gitti. Tekrar dene.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input
        onChange={(e) => setSearchQuery(e.target.value)}
        type="text"
        placeholder=""
        value={searchQuery}></input>
      <button onClick={() => handleSearch()}>Search</button>
    </div>
  );
}
