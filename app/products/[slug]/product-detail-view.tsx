"use client";

import Image from "next/image";
import { Check, Minus, PackageCheck, Plus, Ruler, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import AddToCartButton from "@/components/cart/add-to-cart-button";
import type { Product, ProductVariant } from "@/lib/products";
import { formatPrice } from "@/lib/whatsapp";

type ProductDetailViewProps = {
  product: Product;
};

type ProductTab = "description" | "information";

const tabs: { id: ProductTab; label: string }[] = [
  { id: "description",  label: "Description" },
  { id: "information",  label: "Additional information" },
];

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const hasVariants = product.variants && product.variants.length > 0;

  // Get available colors from variants
  const variantColors = useMemo(() => {
    if (!hasVariants) return [];
    return product.variants!.map((v) => ({
      name: v.color_name,
      code: v.color_code,
    }));
  }, [hasVariants, product.variants]);

  const [selectedColor, setSelectedColor] = useState(variantColors[0]?.name ?? product.colors?.[0] ?? "Natural");

  // Get the active variant based on selected color
  const activeVariant = useMemo(() => {
    if (!hasVariants) return null;
    return product.variants!.find((v) => v.color_name === selectedColor) ?? product.variants![0];
  }, [hasVariants, product.variants, selectedColor]);

  // Get available sizes for the selected color
  const availableSizes = useMemo(() => {
    if (activeVariant?.sizes?.length) {
      return activeVariant.sizes.map((s) => s.size);
    }
    return product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];
  }, [activeVariant, product.sizes]);

  const [selectedSize, setSelectedSize] = useState(availableSizes[0] ?? "S");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ProductTab>("description");

  // Get images for the selected color variant
  const displayImages = useMemo(() => {
    if (activeVariant?.images?.length) {
      return activeVariant.images;
    }
    return product.images;
  }, [activeVariant, product.images]);

  const [selectedImage, setSelectedImage] = useState(displayImages[0]);

  // When color changes, update the image
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const variant = product.variants?.find((v) => v.color_name === color);
    if (variant?.images?.length) {
      setSelectedImage(variant.images[0]);
    } else {
      setSelectedImage(product.images[0]);
    }
    // Reset size selection
    const variantSizes = variant?.sizes?.length
      ? variant.sizes.map((s) => s.size)
      : product.sizes?.length ? product.sizes : ["S", "M", "L", "XL"];
    if (!variantSizes.includes(selectedSize)) {
      setSelectedSize(variantSizes[0] ?? "S");
    }
  };

  // Get the current size's price and stock from the variant
  const currentSizeData = useMemo(() => {
    if (activeVariant?.sizes?.length) {
      return activeVariant.sizes.find((s) => s.size === selectedSize) ?? null;
    }
    return null;
  }, [activeVariant, selectedSize]);

  const displayPrice = currentSizeData?.price ?? product.price;
  const displayComparePrice = currentSizeData?.compare_at_price ?? product.compareAtPrice;
  const displayStock = currentSizeData?.stock_quantity ?? product.quantity;

  // Dimensions for the currently selected size
  const selectedSizeDimensions = useMemo(
    () => product.measurementTable?.find((row) => row.label === selectedSize) ?? null,
    [product.measurementTable, selectedSize],
  );

  // Format selected size dimensions for display
  const formattedDimensions = useMemo(() => {
    if (!selectedSizeDimensions) return product.dimensions;
    
    const parts: string[] = [];
    if (selectedSizeDimensions.height) parts.push(`H: ${selectedSizeDimensions.height}`);
    if (selectedSizeDimensions.width) parts.push(`W: ${selectedSizeDimensions.width}`);
    if (selectedSizeDimensions.length) parts.push(`L: ${selectedSizeDimensions.length}`);
    
    return parts.length > 0 ? parts.join(" × ") : product.dimensions;
  }, [selectedSizeDimensions, product.dimensions]);



  const tabContent = useMemo(() => {
    if (activeTab === "information") {
      return (
        <>
          <dl className="grid max-w-3xl gap-4 text-sm text-[#9a8d82] sm:grid-cols-2">
            <div>
              <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">Material</dt>
              <dd className="mt-2">Stoneware ceramic with a hand-finished glaze.</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">Care</dt>
              <dd className="mt-2">Dishwasher safe. Hand wash recommended for longevity.</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">Dimensions (Size {selectedSize})</dt>
              <dd className="mt-2">{formattedDimensions}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">Materials</dt>
              <dd className="mt-2">{product.materials}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">Category</dt>
              <dd className="mt-2">{product.category}</dd>
            </div>
            <div>
              <dt className="font-semibold uppercase tracking-[0.18em] text-[#171717]">SKU</dt>
              <dd className="mt-2">{product.sku}</dd>
            </div>
          </dl>

          {/* Full measurement table for all sizes */}
          {product.measurementTable?.length ? (
            <div className="mt-8 overflow-x-auto">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                Dimensions by size
              </p>
              <table className="w-full min-w-[400px] border-collapse text-left text-sm">
                <thead className="text-[10px] uppercase tracking-[0.2em] text-[#8a7765]">
                  <tr>
                    <th className="border-b border-[#ded3c8] py-3 pr-4">Size</th>
                    <th className="border-b border-[#ded3c8] py-3 pr-4">Height</th>
                    <th className="border-b border-[#ded3c8] py-3 pr-4">Width</th>
                    <th className="border-b border-[#ded3c8] py-3">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {product.measurementTable.map((row) => (
                    <tr
                      key={row.label}
                      className={`text-[#665b4f] transition ${
                        row.label === selectedSize ? "bg-[#f5eee4]" : ""
                      }`}
                    >
                      <td className="border-b border-[#eadfd4] py-3 pr-4 font-semibold text-[#1b1511]">
                        {row.label}
                        {row.label === selectedSize && (
                          <span className="ml-2 text-[9px] uppercase tracking-wider text-[#9a6b4e]">
                            selected
                          </span>
                        )}
                      </td>
                      <td className="border-b border-[#eadfd4] py-3 pr-4">{row.height || "—"}</td>
                      <td className="border-b border-[#eadfd4] py-3 pr-4">{row.width  || "—"}</td>
                      <td className="border-b border-[#eadfd4] py-3">{row.length || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      );
    }

    // description tab
    return (
      <p className="max-w-5xl text-sm leading-7 text-[#9a8d82]">
        {product.description}
      </p>
    );
  }, [activeTab, product, selectedSize, formattedDimensions]);

  return (
    <>
      <section className="bg-[#fbf8f4] pb-12 pt-28 md:pb-16 md:pt-32 lg:pb-20">
        <div className="site-container">
          <div className="grid gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 xl:gap-20">

            {/* ── Images ── */}
            <div className="grid gap-4 lg:sticky lg:top-28 lg:self-start">
              <div className="relative aspect-[1.02/1] overflow-hidden rounded-[32px] bg-[#eee6dc]">
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
                {displayImages.map((image, index) => {
                  const isSelected = selectedImage === image;
                  return (
                    <button
                      key={`img-${index}`}
                      type="button"
                      className={[
                        "relative aspect-square overflow-hidden rounded-[32px] bg-[#f7f2ec] shadow-sm transition",
                        isSelected
                          ? "border-4 border-[#9D6745]/60 opacity-100 shadow-lg"
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

            {/* ── Info panel ── */}
            <div>
              <div className="rounded-[32px] bg-[#fffdf9] p-6 shadow-sm md:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a6b4e]">
                  {product.category}
                </p>
                <h1 className="mt-4 font-display text-4xl uppercase leading-none tracking-normal sm:text-5xl">
                  {product.name}
                </h1>

                {/* Price */}
                <p className="mt-5 text-xl text-[#9a8d82]">
                  {displayComparePrice ? (
                    <>
                      <span className="mr-3 line-through">{formatPrice(displayComparePrice)}</span>
                      <span className="font-semibold text-[#1b1511]">{formatPrice(displayPrice)}</span>
                    </>
                  ) : (
                    <span className="font-semibold text-[#1b1511]">{formatPrice(displayPrice)}</span>
                  )}
                </p>

                {/* Stock indicator */}
                {displayStock !== undefined && displayStock !== null && (
                  <p className={`mt-2 text-xs ${displayStock > 0 ? "text-green-700" : "text-red-600"}`}>
                    {displayStock > 0 ? `${displayStock} in stock` : "Out of stock"}
                  </p>
                )}

                <p className="mt-8 text-sm leading-8 text-[#6f6259]">{product.shortDescription}</p>

                {/* Spec cards */}
                {/* <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Dimensions", value: formattedDimensions, icon: Ruler },
                    { label: "Materials",  value: product.materials,  icon: PackageCheck },
                    { label: "SKU",        value: product.sku,        icon: ShieldCheck },
                    { label: "Tags",       value: product.tags.join(", "), icon: Check },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="rounded-[32px] bg-[#fbf8f4] p-4 shadow-md">
                        <Icon className="h-4 w-4 text-[#9a6b4e]" />
                        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7765]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-[#1b1511]">{item.value}</p>
                      </div>
                    );
                  })}
                </div> */}

                {/* Size + Color selectors */}
                <div className="mt-8 grid gap-6 border-t border-[#eadfd4] pt-6 sm:grid-cols-2">
                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                      Size
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSizes.map((size) => (
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

                    {/* Selected size dimensions box */}
                    {selectedSizeDimensions && (
                      <div className="mt-4 rounded-2xl border border-[#e8ddd1] bg-[#f5eee4] px-4 py-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9a6b4e]">
                          Size {selectedSize} dimensions
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-[#1b1511]">
                          {selectedSizeDimensions.height && (
                            <span>
                              <span className="text-[10px] uppercase tracking-wider text-[#8a7765]">H </span>
                              {selectedSizeDimensions.height}
                            </span>
                          )}
                          {selectedSizeDimensions.width && (
                            <span>
                              <span className="text-[10px] uppercase tracking-wider text-[#8a7765]">W </span>
                              {selectedSizeDimensions.width}
                            </span>
                          )}
                          {selectedSizeDimensions.length && (
                            <span>
                              <span className="text-[10px] uppercase tracking-wider text-[#8a7765]">L </span>
                              {selectedSizeDimensions.length}
                            </span>
                          )}
                          {!selectedSizeDimensions.height && !selectedSizeDimensions.width && !selectedSizeDimensions.length && (
                            <span className="text-[#a69280]">No dimensions available for this size</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                      Color
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {hasVariants ? (
                        variantColors.map((color) => (
                          <button
                            key={color.name}
                            type="button"
                            onClick={() => handleColorChange(color.name)}
                            className={[
                              "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition",
                              selectedColor === color.name
                                ? "border-[#1b1511] bg-[#1b1511] text-white"
                                : "border-[#ded3c8] bg-white text-[#1b1511] hover:border-[#1b1511]",
                            ].join(" ")}
                          >
                            {color.code && (
                              <span
                                className="h-4 w-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.code }}
                              />
                            )}
                            {color.name}
                          </button>
                        ))
                      ) : (
                        (product.colors?.length ? product.colors : ["Natural"]).map((color, i) => (
                          <button
                            key={`color-${i}`}
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
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity + Add to cart */}
                <div className="mt-8 border-t border-[#eadfd4] pt-6">
                  <label
                    htmlFor="product-quantity"
                    className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a7765]"
                  >
                    Quantity
                  </label>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="grid h-14 w-full grid-cols-[48px_56px_48px] overflow-hidden rounded-[32px] border border-[#ded3c8] bg-white shadow-md sm:w-[152px]">
                      <button
                        type="button"
                        className="flex items-center justify-center text-[#7d746d] transition hover:bg-[#f7f2ec] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-35"
                        aria-label="Decrease quantity"
                        disabled={quantity === 1}
                        onClick={() => setQuantity((v) => Math.max(1, v - 1))}
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
                        disabled={displayStock ? quantity >= displayStock : false}
                        onClick={() => setQuantity((v) => Math.min(displayStock || v + 1, v + 1))}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <AddToCartButton
                      product={{ ...product, price: displayPrice }}
                      quantity={quantity}
                      size={selectedSize}
                      color={selectedColor}
                      className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-[#1b1511] px-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md transition hover:bg-[#2a211a]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabs section ── */}
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

          <div className="mt-7 rounded-[32px] bg-[#fbf8f4] p-6 shadow-md md:p-8">
            {tabContent}
          </div>
        </div>
      </section>
    </>
  );
}
