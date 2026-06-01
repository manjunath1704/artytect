"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "@/components/cart/cart-provider";
import type { Product } from "@/lib/products";

type AddToCartButtonProps = {
  product: Product;
  quantity?: number;
  className?: string;
  children?: React.ReactNode;
};

export default function AddToCartButton({
  product,
  quantity = 1,
  className,
  children = "Add to cart",
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem(product, quantity);
        toast.success(`${product.name} added to cart.`);
      }}
    >
      <ShoppingCart className="h-4 w-4" />
      <span>{children}</span>
    </button>
  );
}
