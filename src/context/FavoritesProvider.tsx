// Holds the global favorites list and syncs it with localStorage.
import React, { useEffect, useState } from "react";
import type { Product } from "../types";
import { FavoritesContext } from "./FavoritesContext";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("myFavorites") ?? "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("myFavorites", JSON.stringify(favorites));
  }, [favorites]);

  function toggleFavorite(product: Product) {
    if (favorites.some((p) => p.code === product.code)) {
      setFavorites(favorites.filter((p) => p.code !== product.code));
    } else {
      setFavorites([...favorites, product]);
    }
  }

  function isFavorite(code: string) {
    return favorites.some((p) => p.code === code);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
      }}>
      {children}
    </FavoritesContext.Provider>
  );
}
