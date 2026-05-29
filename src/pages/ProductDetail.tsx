import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Product } from "../types";
import { triggers } from "../constants/triggers";

export default function ProductDetail() {
  // Extract product ID from URL parameters
  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);

  // Retrieve user's custom trigger ingredients from localStorage
  const customTriggers: string[] = JSON.parse(
    localStorage.getItem("myTriggers") ?? "[]",
  );
  // Combine predefined triggers with user's custom triggers
  const allTriggers = [...triggers, ...customTriggers];

  // Check if any trigger ingredients are present in the product's ingredient list
  const foundTriggers = allTriggers.filter((trigger) =>
    product?.ingredients_text_en?.toLowerCase().includes(trigger),
  );

  // Extract nutrients that are marked as "high" from the product's nutritional information
  let highNutrients: [string, string][] = [];
  if (product?.nutrient_levels) {
    highNutrients = Object.entries(product.nutrient_levels).filter(
      ([, value]) => value === "high",
    );
  }

  // Fetch product details from API using the product ID from URL
  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`/api/api/v2/product/${id}`);
      const data = await res.json();
      setProduct(data.product);
    }
    fetchProduct();
  }, [id]);

  return (
    <>
      {/* Conditional rendering: Show loading message while fetching product details */}
      {product === null ? (
        <p>Loading...</p>
      ) : (
        <div>
          <img src={product.image_front_url} />
          <p>{product.product_name}</p>
          <p>{product.brands}</p>
          {/* Warning message if trigger ingredients are found */}
          {product.ingredients_text_en && (
            <p>
              {" "}
              This product is risky for you because it contains{"  "}
              {foundTriggers.join(", ")}{" "}
            </p>
          )}
          {/* Caution message if high nutrients are detected */}
          {highNutrients.length > 0 && (
            <p>
              You must be cautious because this product contains high
              {highNutrients.map(([name]) => name).join(", ")}
            </p>
          )}
        </div>
      )}
    </>
  );
}
