"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCart } from "./cart-provider";
import type { PotteryClass } from "@/lib/classes";

export function AddClassToCart({ classData }: { classData: PotteryClass }) {
  const { addClass } = useCart();
  const [seats, setSeats] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (seats < 1 || seats > classData.available_seats) {
      toast.error(`Please select 1 to ${classData.available_seats} seats`);
      return;
    }

    setIsAdding(true);
    try {
      addClass(classData, seats);
      toast.success(`Added ${seats} seat(s) to cart`);
      setSeats(1);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isAdding || classData.available_seats === 0}
      className="h-11 w-full flex items-center justify-center gap-2 rounded-full bg-[#1b1511] text-white font-semibold uppercase tracking-[0.16em] text-sm transition hover:bg-[#3a2f27] disabled:opacity-60"
      title={classData.available_seats === 0 ? "No seats available" : "Add to cart"}
    >
      {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Add to cart
    </button>
  );
}
