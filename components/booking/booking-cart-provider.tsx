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

import type { PotteryClass } from "@/lib/classes";

export type BookingCartItem = {
  id: string;
  classId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  seats: number;
  instructor: string;
  date: string;
  time: string;
};

type BookingCartContextValue = {
  items: BookingCartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (classData: PotteryClass, seats?: number) => void;
  updateSeats: (classId: string, seats: number) => void;
  removeItem: (classId: string) => void;
  clearCart: () => void;
};

const BOOKING_CART_STORAGE_KEY = "haritham-booking-cart";
const BookingCartContext = createContext<BookingCartContextValue | null>(null);

function readStoredBookingCart(): BookingCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const storedCart = window.localStorage.getItem(BOOKING_CART_STORAGE_KEY);
    if (!storedCart) return [];

    const parsedCart = JSON.parse(storedCart) as BookingCartItem[];
    if (!Array.isArray(parsedCart)) return [];

    return parsedCart.filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.classId === "string" &&
        typeof item.title === "string" &&
        typeof item.price === "number" &&
        typeof item.image === "string" &&
        typeof item.seats === "number" &&
        item.seats > 0,
    );
  } catch {
    return [];
  }
}

export function BookingCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BookingCartItem[]>([]);

  useEffect(() => {
    setItems(readStoredBookingCart());
  }, []);

  useEffect(() => {
    window.localStorage.setItem(BOOKING_CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((classData: PotteryClass, seats = 1) => {
    const safeSeats = Math.max(1, Math.min(Math.floor(seats), classData.available_seats));

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.classId === classData.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.classId === classData.id
            ? { ...item, seats: Math.min(item.seats + safeSeats, classData.available_seats) }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          id: classData.id,
          classId: classData.id,
          slug: classData.slug,
          title: classData.title,
          price: classData.price,
          image: classData.thumbnail_url,
          seats: safeSeats,
          instructor: classData.instructor_name,
          date: classData.class_date,
          time: classData.class_time,
        },
      ];
    });
  }, []);

  const updateSeats = useCallback((classId: string, seats: number) => {
    const safeSeats = Math.max(1, Math.floor(seats));
    setItems((currentItems) =>
      currentItems.map((item) => (item.classId === classId ? { ...item, seats: safeSeats } : item)),
    );
  }, []);

  const removeItem = useCallback((classId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.classId !== classId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = useMemo(
    () => items.reduce((total, item) => total + item.seats, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.seats, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      addItem,
      updateSeats,
      removeItem,
      clearCart,
    }),
    [addItem, clearCart, items, removeItem, subtotal, totalItems, updateSeats],
  );

  return <BookingCartContext.Provider value={value}>{children}</BookingCartContext.Provider>;
}

export function useBookingCart() {
  const context = useContext(BookingCartContext);

  if (!context) {
    throw new Error("useBookingCart must be used inside BookingCartProvider.");
  }

  return context;
}
