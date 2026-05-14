"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import WhatsAppButton from "@/components/whatsapp-button";
import type { Product } from "@/lib/products";
import { formatPrice, getProductOrderMessage } from "@/lib/whatsapp";

type ProductDetailViewProps = {
  product: Product;
};

type ProductTab = "description" | "information" | "reviews";

const tabs: { id: ProductTab; label: string }[] = [
  { id: "description", label: "Description" },
  { id: "information", label: "Additional information" },
  { id: "reviews", label: "Reviews (0)" },
];

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ProductTab>("description");
  const whatsappMessage = useMemo(() => getProductOrderMessage(product), [product]);

  const tabContent = useMemo(() => {
    if (activeTab === "information") {
      return (
        <dl className="grid max-w-3xl gap-4 text-sm text-[#9a8d82] sm:grid-cols-2">
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
              Material
            </dt>
            <dd className="mt-2">Stoneware ceramic with a hand-finished glaze.</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
              Care
            </dt>
            <dd className="mt-2">Dishwasher safe. Hand wash recommended for longevity.</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
              Dimensions
            </dt>
            <dd className="mt-2">{product.dimensions}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
              Materials
            </dt>
            <dd className="mt-2">{product.materials}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
              Category
            </dt>
            <dd className="mt-2">{product.category}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
              SKU
            </dt>
            <dd className="mt-2">{product.sku}</dd>
          </div>
        </dl>
      );
    }

    if (activeTab === "reviews") {
      return (
        <p className="max-w-5xl text-sm leading-7 text-[#9a8d82]">
          No reviews yet. Be the first to share how this piece settled into your
          home.
        </p>
      );
    }

    return (
      <p className="max-w-5xl text-sm leading-7 text-[#9a8d82]">
        {product.description}
      </p>
    );
  }, [activeTab, product]);

  return (
    <>
      <section className="py-12 md:py-16 lg:py-20">
        <div className="site-container">
          <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-20">
            <div className="grid gap-4 sm:grid-cols-[112px_1fr]">
              <div className="order-2 grid grid-cols-4 gap-3 sm:order-1 sm:grid-cols-1">
                {product.images.map((image, index) => {
                  const isSelected = selectedImage === image;

                  return (
                    <button
                      key={image}
                      type="button"
                      className={[
                        "relative aspect-square overflow-hidden bg-[#f7f5f3] transition",
                        isSelected
                          ? "ring-1 ring-[#171717]"
                          : "opacity-70 hover:opacity-100",
                      ].join(" ")}
                      aria-label={`Show ${product.name} view ${index + 1}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="relative order-1 aspect-[1.06/1] overflow-hidden bg-[#f7f5f3] sm:order-2">
                {product.badge ? (
                  <span className="absolute right-0 top-6 z-10 bg-[#f8e8e1] px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]">
                    {product.badge}
                  </span>
                ) : null}
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 48vw, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="lg:pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a8d82]">
                {product.category}
              </p>
              <h1 className="mt-3 text-4xl font-semibold uppercase tracking-[0.03em] sm:text-5xl">
                {product.name}
              </h1>
              <p className="mt-4 text-lg text-[#9a8d82]">
                {product.compareAtPrice ? (
                  <>
                    <span className="mr-3 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                    <span className="text-[#1b1511]">{formatPrice(product.price)}</span>
                  </>
                ) : (
                  formatPrice(product.price)
                )}
              </p>

              <p className="mt-10 max-w-lg text-sm leading-7 text-[#9a8d82]">
                {product.shortDescription}
              </p>

              <dl className="mt-7 space-y-2 text-xs leading-5 text-[#9a8d82]">
                <div className="flex gap-1">
                  <dt>SKU:</dt>
                  <dd className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
                    {product.sku}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt>Category:</dt>
                  <dd className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
                    {product.category}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt>Dimensions:</dt>
                  <dd className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
                    {product.dimensions}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt>Materials:</dt>
                  <dd className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
                    {product.materials}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt>Tags:</dt>
                  <dd className="font-semibold uppercase tracking-[0.18em] text-[#171717]">
                    {product.tags.join(", ")}
                  </dd>
                </div>
              </dl>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div>
                  <label
                    htmlFor="product-quantity"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a8d82]"
                  >
                    Quantity
                  </label>
                  <div className="grid h-14 w-full grid-cols-[48px_56px_48px] border border-black/10 bg-white sm:w-[152px]">
                    <button
                      type="button"
                      className="flex items-center justify-center text-[#7d746d] transition hover:bg-[#f7f5f3] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-35"
                      aria-label="Decrease quantity"
                      disabled={quantity === 1}
                      onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <output
                      id="product-quantity"
                      className="flex items-center justify-center border-x border-black/10 text-sm font-semibold tabular-nums text-[#171717]"
                      aria-live="polite"
                    >
                      {quantity}
                    </output>
                    <button
                      type="button"
                      className="flex items-center justify-center text-[#7d746d] transition hover:bg-[#f7f5f3] hover:text-[#171717]"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity((value) => value + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <WhatsAppButton
                  message={whatsappMessage}
                  className="h-14 px-10 sm:min-w-56"
                >
                  Order via WhatsApp
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-12">
        <div className="site-container">
          <div className="flex flex-wrap gap-8 border-b border-black/10 text-[11px] font-semibold uppercase tracking-[0.24em]">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  className={[
                    "pb-5 transition",
                    isActive
                      ? "border-b border-[#171717] text-[#171717]"
                      : "text-[#7d746d] hover:text-[#171717]",
                  ].join(" ")}
                  aria-pressed={isActive}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="mt-7">{tabContent}</div>
        </div>
      </section>

      <div className="fixed inset-x-4 bottom-4 z-[70] md:hidden">
        <WhatsAppButton message={whatsappMessage} className="h-14 w-full">
          Order via WhatsApp
        </WhatsAppButton>
      </div>
    </>
  );
}
