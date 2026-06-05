"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/components/cart/cart-provider";
import { formatPrice } from "@/lib/whatsapp";

export default function CartContent() {
  const { items, subtotal, updateQuantity, updateSeats, removeItem } = useCart();

  const productItems = items.filter(item => item.type === "product");
  const classItems = items.filter(item => item.type === "class");

  return (
    <main className="min-h-screen bg-[#fbf8f4] pb-16 pt-28 text-[#171717]">
      <div className="site-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-black/10 pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">Cart</p>
            <h1 className="mt-2 text-4xl font-display uppercase leading-none">Your pieces</h1>
          </div>
          <p className="text-sm text-[#665b4f]">{items.length} item{items.length === 1 ? "" : "s"}</p>
        </div>

        {items.length ? (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {/* Products Section */}
              {productItems.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#665b4f]">Products</h3>
                  {productItems.map((item) => (
                    <article key={item.id} className="grid gap-4 rounded-[32px] bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto] mb-4">
                      <Link href={`/products/${item.slug}`} className="relative aspect-square overflow-hidden rounded-[24px] bg-[#eee6dc]">
                        <Image src={item.image} alt={item.name} fill sizes="120px" className="object-cover" />
                      </Link>
                      <div>
                        <Link href={`/products/${item.slug}`} className="text-lg font-semibold uppercase tracking-[0.08em] hover:text-[#8a5f3b]">
                          {item.name}
                        </Link>
                        <p className="mt-2 text-sm text-[#665b4f]">{formatPrice(item.price)}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#665b4f]">
                          <span className="rounded-full bg-[#faf6f2] px-3 py-1">Size {item.size}</span>
                          <span className="rounded-full bg-[#faf6f2] px-3 py-1">{item.color}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="grid h-11 grid-cols-[40px_48px_40px] overflow-hidden rounded-full border border-[#ded3c8] bg-white">
                          <button type="button" aria-label="Decrease quantity" disabled={(item.quantity || 0) === 1} onClick={() => updateQuantity(item.id, (item.quantity || 0) - 1)} className="grid place-items-center disabled:opacity-35">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <output className="grid place-items-center border-x border-[#ded3c8] text-sm font-semibold">{item.quantity || 0}</output>
                          <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(item.id, (item.quantity || 0) + 1)} className="grid place-items-center">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ded3c8] text-[#665b4f] transition hover:border-red-300 hover:text-red-600" aria-label="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Classes Section */}
              {classItems.length > 0 && (
                <div>
                  {productItems.length > 0 && <hr className="my-6 border-[#e2d6ca]" />}
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#665b4f]">Classes</h3>
                  {classItems.map((item) => (
                    <article key={item.id} className="grid gap-4 rounded-[32px] bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto] mb-4">
                      <Link href={`/classes/${item.slug}`} className="relative aspect-square overflow-hidden rounded-[24px] bg-[#eee6dc]">
                        <Image src={item.image} alt={item.name} fill sizes="120px" className="object-cover" />
                      </Link>
                      <div>
                        <Link href={`/classes/${item.slug}`} className="text-lg font-semibold uppercase tracking-[0.08em] hover:text-[#8a5f3b]">
                          {item.name}
                        </Link>
                        <p className="mt-2 text-sm text-[#665b4f]">{formatPrice(item.price)}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#665b4f]">
                          {item.date && <span className="rounded-full bg-[#faf6f2] px-3 py-1">{item.date}</span>}
                          {item.time && <span className="rounded-full bg-[#faf6f2] px-3 py-1">{item.time}</span>}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="grid h-11 grid-cols-[40px_48px_40px] overflow-hidden rounded-full border border-[#ded3c8] bg-white">
                          <button type="button" aria-label="Decrease seats" disabled={(item.seats || 0) === 1} onClick={() => updateSeats(item.id, (item.seats || 0) - 1)} className="grid place-items-center disabled:opacity-35">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <output className="grid place-items-center border-x border-[#ded3c8] text-sm font-semibold">{item.seats || 0}</output>
                          <button type="button" aria-label="Increase seats" onClick={() => updateSeats(item.id, (item.seats || 0) + 1)} className="grid place-items-center">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ded3c8] text-[#665b4f] transition hover:border-red-300 hover:text-red-600" aria-label="Remove item">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <aside className="h-fit rounded-[32px] bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em]">Order summary</h2>
              <div className="mt-6 space-y-3 border-b border-[#eadfd4] pb-5 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Total</span><span className="font-semibold">{formatPrice(subtotal)}</span></div>
              </div>
              <Link href="/checkout" className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3a2f27]">
                Checkout
              </Link>
            </aside>
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-black/15 bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-3xl font-display uppercase">Your cart is empty</h2>
            <Link href="/products" className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
              Browse products
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
