"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "@/lib/products";
import type { PotteryClass } from "@/lib/classes";

// Union type for cart items - supports both products and classes
export type CartItem = {
  id: string;
  productId?: string;
  classId?: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity?: number;
  seats?: number;
  type: "product" | "class";
  date?: string;
  time?: string;
  instructor?: string;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  addProduct: (product: Product, quantity?: number, options?: { size?: string; color?: string }) => void;
  addClass: (classData: PotteryClass, seats?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSeats: (id: string, seats: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
};

const CART_STORAGE_KEY = "haritham-cart";
const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart) as CartItem[];
    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.image === "string" &&
        typeof item.type === "string" &&
        ((item.type === "product" && item.quantity && item.quantity > 0) ||
          (item.type === "class" && item.seats && item.seats > 0))
    ).map((item) => ({
      ...item,
      productId: item.productId || (item.type === "product" ? item.id.split("::")[0] : undefined),
      classId: item.classId || (item.type === "class" ? item.id : undefined),
      slug: item.slug || item.id,
    }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readStoredCart());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addProduct = useCallback((product: Product, quantity = 1, options?: { size?: string; color?: string }) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    const selectedSize = options?.size || product.sizes?.[0] || "S";
    const selectedColor = options?.color || product.colors?.[0] || "Natural";
    const cartId = `${product.id}::${selectedSize}::${selectedColor}`;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === cartId && item.type === "product");

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === cartId && item.type === "product"
            ? { ...item, quantity: (item.quantity || 0) + safeQuantity }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id: cartId,
          productId: product.id,
          type: "product" as const,
          slug: product.slug || product.name,
          name: product.name,
          price: Number(product.price),
          image: product.thumbnail || product.images?.[0] || "",
          size: selectedSize,
          color: selectedColor,
          quantity: safeQuantity,
        },
      ];
    });
  }, []);

  const addClass = useCallback((classData: PotteryClass, seats = 1) => {
    const safeSeats = Math.max(1, Math.min(Math.floor(seats), classData.available_seats));
    const cartId = classData.id;

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === cartId && item.type === "class");

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === cartId && item.type === "class"
            ? { ...item, seats: Math.min((item.seats || 0) + safeSeats, classData.available_seats) }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id: cartId,
          classId: classData.id,
          type: "class" as const,
          slug: classData.slug,
          name: classData.title,
          price: classData.price,
          image: classData.thumbnail_url,
          seats: safeSeats,
          date: classData.class_date,
          time: classData.class_time,
          instructor: classData.instructor_name,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    const safeQuantity = Math.max(1, Math.floor(quantity));
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id && item.type === "product"
          ? { ...item, quantity: safeQuantity }
          : item,
      ),
    );
  }, []);

  const updateSeats = useCallback((id: string, seats: number) => {
    const safeSeats = Math.max(1, Math.floor(seats));
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id && item.type === "class"
          ? { ...item, seats: safeSeats }
          : item,
      ),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || item.seats || 0), 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * (item.quantity || item.seats || 1), 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalQuantity,
      subtotal,
      addProduct,
      addClass,
      updateQuantity,
      updateSeats,
      removeItem,
      clearCart,
    }),
    [addProduct, addClass, clearCart, items, removeItem, subtotal, totalQuantity, updateQuantity, updateSeats],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
