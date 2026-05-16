"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Ruler, Sparkles } from "lucide-react";

import WhatsAppButton from "@/components/whatsapp-button";
import type { Product } from "@/lib/products";
import { cn } from "@/lib/utils";
import { formatPrice, getProductOrderMessage } from "@/lib/whatsapp";

type ProductCardProps = {
  product: Product;
  className?: string;
  imageSizes?: string;
};

export default function ProductCard({
  product,
  className,
  imageSizes = "(min-width: 1024px) 23vw, (min-width: 640px) 45vw, calc(100vw - 48px)",
}: ProductCardProps) {
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-[32px] shadow-sm bg-[#fffdf9] shadow-sm transition-shadow",
        className,
      )}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#eee6dc]">
          {product.badge ? (
            <span className="absolute right-4 top-4 z-10 rounded-full border border-white/45 bg-[#1b1511]/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
              {product.badge}
            </span>
          ) : null}
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes={imageSizes}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,21,17,0.04),rgba(27,21,17,0.08)_45%,rgba(27,21,17,0.52))] opacity-80 transition group-hover:opacity-100" />
          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ead7c3]">
                {product.category}
              </p>
              <h3 className="mt-2 text-2xl font-display uppercase leading-none tracking-normal">
                {product.name}
              </h3>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 backdrop-blur transition group-hover:bg-white group-hover:text-[#1b1511]">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a6b4e]">
            {/* <Sparkles className="h-3.5 w-3.5" /> */}
            Handmade
          </div>
          <p className="text-right text-sm font-semibold text-[#1b1511]">
            {product.compareAtPrice ? (
              <>
                <span className="mr-2 text-[#9a8d82] line-through">
                  {formatPrice(product.compareAtPrice)}
                </span>
                <span>{formatPrice(product.price)}</span>
              </>
            ) : (
              formatPrice(product.price)
            )}
          </p>
        </div>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#7d746d]">
          {product.shortDescription}
        </p>

        <div className="mt-3 flex items-center gap-2 rounded-2xl shadow-md bg-[#faf6f2] px-3 py-2 text-xs text-[#6f6259]">
          <Ruler className="h-3.5 w-3.5 text-[#9a6b4e]" />
          <span className="line-clamp-1">{product.dimensions}</span>
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
          <WhatsAppButton
            message={getProductOrderMessage(product)}
            className="h-11 rounded-full px-4"
          >
            Order Now
          </WhatsAppButton>
          <Link
            href={`/products/${product.id}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#ded3c8] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:border-[#1b1511]"
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
