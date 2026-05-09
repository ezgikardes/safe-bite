import type { Product } from "../types";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div>
      <p>{product.product_name}</p>
    </div>
  );
}
