"use client";

import Image from "next/image";
import { Check, Minus, PackageCheck, Plus, Ruler, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import AddToCartButton from "@/components/cart/add-to-cart-button";
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
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] ?? "S");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] ?? "Natural");
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
      <section className="bg-[#fbf8f4] pb-12 pt-28 md:pb-16 md:pt-32 lg:pb-20">
        <div className="site-container">
          <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 xl:gap-20">
            <div className="grid gap-4 lg:sticky lg:top-28 lg:self-start">
              <div className="relative aspect-[1.02/1] overflow-hidden bg-[#eee6dc] rounded-[32px] ">
                {/* {product.badge ? (
                  <span className="absolute right-5 top-5 z-10 border border-white/45 bg-[#1b1511]/75 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
                    {product.badge}
                  </span>
                ) : null} */}
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 52vw, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => {
                  const isSelected = selectedImage === image;

                  return (
                    <button
                      key={image}
                      type="button"
                      className={[
                        "relative aspect-square overflow-hidden shadow-sm bg-[#f7f2ec] transition rounded-[32px]",
                        isSelected
                          ? "border-4 border-[#9D6745]/60 opacity-100 shadow-lg "
                          : "border-transparent opacity-70 hover:opacity-100",
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
            </div>

            <div>
              <div className="shadow-sm rounded-[32px] bg-[#fffdf9] p-6 md:p-8">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a6b4e]">
                  
                  {product.category}
                </p>
                <h1 className="mt-4 text-4xl font-display uppercase leading-none tracking-normal sm:text-5xl">
                  {product.name}
                </h1>
                <p className="mt-5 text-xl text-[#9a8d82]">
                  {product.compareAtPrice ? (
                    <>
                      <span className="mr-3 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                      <span className="font-semibold text-[#1b1511]">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="font-semibold text-[#1b1511]">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </p>

                <p className="mt-8 text-sm leading-8 text-[#6f6259]">
                  {product.shortDescription}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Dimensions", value: product.dimensions, icon: Ruler },
                    { label: "Materials", value: product.materials, icon: PackageCheck },
                    { label: "SKU", value: product.sku, icon: ShieldCheck },
                    { label: "Tags", value: product.tags.join(", "), icon: Check },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="rounded-[32px] shadow-md bg-[#fbf8f4] p-4">
                        <Icon className="h-4 w-4 text-[#9a6b4e]" />
                        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7765]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#1b1511]">
                          {item.value}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 grid gap-6 border-t border-[#eadfd4] pt-6 sm:grid-cols-2">
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                      Size
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {(product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"]).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={[
                            "h-11 rounded-full border text-xs font-semibold transition",
                            selectedSize === size
                              ? "border-[#1b1511] bg-[#1b1511] text-white"
                              : "border-[#ded3c8] bg-white text-[#1b1511] hover:border-[#1b1511]",
                          ].join(" ")}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                      Color
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(product.colors?.length ? product.colors : ["Natural"]).map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={[
                            "h-11 rounded-full border px-4 text-xs font-semibold transition",
                            selectedColor === color
                              ? "border-[#1b1511] bg-[#1b1511] text-white"
                              : "border-[#ded3c8] bg-white text-[#1b1511] hover:border-[#1b1511]",
                          ].join(" ")}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-[#eadfd4] pt-6">
                  <label
                    htmlFor="product-quantity"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]"
                  >
                    Quantity
                  </label>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="grid h-14 w-full grid-cols-[48px_56px_48px] border border-[#ded3c8] overflow-hidden shadow-md rounded-[32px] bg-white sm:w-[152px]">
                      <button
                        type="button"
                        className="flex items-center justify-center text-[#7d746d] transition hover:bg-[#f7f2ec] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Decrease quantity"
                        disabled={quantity === 1}
                        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <output
                        id="product-quantity"
                        className="flex items-center justify-center border-x border-[#ded3c8] text-sm font-semibold tabular-nums text-[#171717]"
                        aria-live="polite"
                      >
                        {quantity}
                      </output>
                      <button
                        type="button"
                        className="flex items-center justify-center text-[#7d746d] transition hover:bg-[#f7f2ec] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Increase quantity"
                        disabled={product.quantity ? quantity >= product.quantity : false}
                        onClick={() => setQuantity((value) => Math.min(product.quantity || value + 1, value + 1))}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <WhatsAppButton
                      message={whatsappMessage}
                      className="h-14 flex-1 px-10"
                    >
                      Order via WhatsApp
                    </WhatsAppButton>
                    <AddToCartButton
                      product={product}
                      quantity={quantity}
                      size={selectedSize}
                      color={selectedColor}
                      className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-[#ded3c8] bg-white px-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] shadow-md transition hover:border-[#1b1511] hover:bg-[#faf6f2]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#ded3c8] bg-white py-12">
        <div className="site-container">
          <div className="flex flex-wrap gap-8 border-b border-[#ded3c8] text-[11px] font-semibold uppercase tracking-[0.24em]">
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
          <div className="mt-7 rounded-[32px] shadow-md bg-[#fbf8f4] p-6 md:p-8">
            {tabContent}
            {activeTab === "information" && product.measurementTable?.length ? (
              <div className="mt-8 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-[0.2em] text-[#8a7765]">
                    <tr>
                      <th className="border-b border-[#ded3c8] py-3">Measurement</th>
                      <th className="border-b border-[#ded3c8] py-3">S</th>
                      <th className="border-b border-[#ded3c8] py-3">M</th>
                      <th className="border-b border-[#ded3c8] py-3">L</th>
                      <th className="border-b border-[#ded3c8] py-3">XL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.measurementTable.map((row) => (
                      <tr key={row.label} className="text-[#665b4f]">
                        <td className="border-b border-[#eadfd4] py-3 font-semibold text-[#1b1511]">{row.label}</td>
                        <td className="border-b border-[#eadfd4] py-3">{row.s}</td>
                        <td className="border-b border-[#eadfd4] py-3">{row.m}</td>
                        <td className="border-b border-[#eadfd4] py-3">{row.l}</td>
                        <td className="border-b border-[#eadfd4] py-3">{row.xl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
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
