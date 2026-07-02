"use client";

import { useState } from "react";
import { Loader2, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { useBookingCart } from "./booking-cart-provider";
import type { PotteryClass } from "@/lib/classes";

export function AddToBookingCart({ classData }: { classData: PotteryClass }) {
  const { addItem } = useBookingCart();
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
      addItem(classData, seats);
      toast.success(`Added ${seats} seat(s) to booking cart`);
      setSeats(1);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-[#f5eee4] p-4">
        <label className="block">
          <span className="text-sm font-medium text-[#352a21]">Number of seats</span>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSeats(Math.max(1, seats - 1))}
              disabled={seats <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9ccbc] bg-white text-[#1b1511] transition hover:bg-[#f5eee4] disabled:opacity-50"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min="1"
              max={classData.available_seats}
              value={seats}
              onChange={(e) => {
                const val = Math.max(1, Math.min(parseInt(e.target.value) || 1, classData.available_seats));
                setSeats(val);
              }}
              className="w-16 text-center rounded-lg border border-[#d9ccbc] bg-white px-2 py-2 text-sm font-semibold"
            />
            <button
              type="button"
              onClick={() => setSeats(Math.min(classData.available_seats, seats + 1))}
              disabled={seats >= classData.available_seats}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9ccbc] bg-white text-[#1b1511] transition hover:bg-[#f5eee4] disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
            </button>
            <span className="ml-auto text-sm text-[#8a7765]">
              {classData.available_seats} available
            </span>
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isAdding}
        className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-[#1b1511] text-white font-semibold uppercase tracking-[0.16em] text-sm transition hover:bg-[#3a2f27] disabled:opacity-60"
      >
        {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Add to booking cart
      </button>

      <Link
        href="/classes/checkout"
        className="block w-full h-12 text-center rounded-full bg-[#f5eee4] text-[#1b1511] font-semibold uppercase tracking-[0.16em] text-sm transition hover:bg-[#e8ddd1] leading-[48px]"
      >
        Go to checkout
      </Link>
    </div>
  );
}
