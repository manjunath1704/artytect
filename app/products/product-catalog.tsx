"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import ProductCard from "@/app/components/cards/product-card";
import { AppSelect, type SelectOption } from "@/components/ui/app-select";
import type { Product } from "@/lib/products";

type ProductCatalogProps = {
  products: Product[];
};

type PriceFilter = "all" | "under-150" | "150-250" | "over-250";
type SortOption = "featured" | "price-asc" | "price-desc" | "name-asc";

const pageSize = 15;

const priceOptions: SelectOption<PriceFilter>[] = [
  { label: "All prices", value: "all" },
  { label: "Under ₹1,500", value: "under-150" },
  { label: "₹1,500-₹2,500", value: "150-250" },
  { label: "Over ₹2,500", value: "over-250" },
];

const sortOptions: SelectOption<SortOption>[] = [
  { label: "Featured", value: "featured" },
  { label: "Price low to high", value: "price-asc" },
  { label: "Price high to low", value: "price-desc" },
  { label: "Name A-Z", value: "name-asc" },
];

export default function ProductCatalog({ products }: ProductCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
  const [sort, setSort] = useState<SortOption>("featured");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );
  const categoryOptions = useMemo<SelectOption[]>(
    () => categories.map((item) => ({ value: item, label: item })),
    [categories],
  );

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextProducts = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          product.name,
          product.category,
          product.sku,
          product.shortDescription,
          product.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesCategory = category === "All" || product.category === category;
      const matchesPrice =
        priceFilter === "all" ||
        (priceFilter === "under-150" && product.price < 1500) ||
        (priceFilter === "150-250" && product.price >= 1500 && product.price <= 2500) ||
        (priceFilter === "over-250" && product.price > 2500);

      return matchesQuery && matchesCategory && matchesPrice;
    });

    return [...nextProducts].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "name-asc") return a.name.localeCompare(b.name);
      return products.findIndex((product) => product.id === a.id) -
        products.findIndex((product) => product.id === b.id);
    });
  }, [category, priceFilter, products, query, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const hasActiveFilters =
    query.trim() || category !== "All" || priceFilter !== "all" || sort !== "featured";

  const updateFilters = (callback: () => void) => {
    callback();
    setPage(1);
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("All");
    setPriceFilter("all");
    setSort("featured");
    setPage(1);
  };

  return (
    <section className="py-14 md:py-20">
      <div className="site-container">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a8d82]">
              Catalog
            </p>
            <h2 className="mt-2 text-sm font-semibold uppercase tracking-[0.24em]">
              All products
            </h2>
          </div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#8a817a]">
            {filteredProducts.length} of {products.length} pieces
          </p>
        </div>

        <div className="mb-10 rounded-[32px] shadow-sm bg-[#fcfaf7] p-4 shadow-sm md:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_220px_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a817a]">
                Search
              </span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8d82]" />
                <input
                  type="search"
                  value={query}
                  onChange={(event) =>
                    updateFilters(() => setQuery(event.target.value))
                  }
                  placeholder="Search by product, tag, SKU"
                  className="h-12 w-full rounded-full border border-black/10 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-[#a59b93] focus:border-[#1b1511]"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a817a]">
                Category
              </span>
              <AppSelect
                instanceId="product-category"
                value={categoryOptions.find((option) => option.value === category)}
                options={categoryOptions}
                onChange={(option) => updateFilters(() => setCategory(option?.value ?? "All"))}
                isClearable
                placeholder="All"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a817a]">
                Price
              </span>
              <AppSelect<SelectOption<PriceFilter>>
                instanceId="product-price"
                value={priceOptions.find((option) => option.value === priceFilter)}
                options={priceOptions}
                onChange={(option) => updateFilters(() => setPriceFilter(option?.value ?? "all"))}
                isClearable
                placeholder="All prices"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a817a]">
                Sort
              </span>
              <AppSelect<SelectOption<SortOption>>
                instanceId="product-sort"
                value={sortOptions.find((option) => option.value === sort)}
                options={sortOptions}
                onChange={(option) => updateFilters(() => setSort(option?.value ?? "featured"))}
                isClearable
                placeholder="Featured"
              />
            </label>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:border-[#1b1511] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((item) => {
              const isActive = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateFilters(() => setCategory(item))}
                  className={[
                    "inline-flex h-9 items-center gap-2 rounded-full border px-4 text-[10px] font-semibold uppercase tracking-[0.18em] transition",
                    isActive
                      ? "border-[#1b1511] bg-[#1b1511] text-white"
                      : "border-black/10 bg-white text-[#665b4f] hover:border-[#1b1511]",
                  ].join(" ")}
                >
                  {item === "All" ? <SlidersHorizontal className="h-3.5 w-3.5" /> : null}
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {visibleProducts.length ? (
          <div className="grid gap-3 md:gap-7 grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-dashed border-black/20 bg-[#fcfaf7] px-6 py-14 text-center shadow-sm">
            <h3 className="text-2xl font-display tracking-normal">
              No products found
            </h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#7d746d]">
              Try a different search term or clear the filters to see the full
              collection.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full border border-[#1b1511] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:bg-[#1b1511] hover:text-white"
            >
              Reset catalog
            </button>
          </div>
        )}

        <div className="mt-14 flex flex-col items-center justify-between gap-5 border-t border-black/10 pt-6 sm:flex-row">
          <p className="text-xs uppercase tracking-[0.18em] text-[#8a817a]">
            Page {currentPage} of {pageCount}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 transition hover:border-[#1b1511] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={[
                    "h-11 w-11 rounded-full border text-xs font-semibold transition",
                    currentPage === pageNumber
                      ? "border-[#1b1511] bg-[#1b1511] text-white"
                      : "border-black/10 hover:border-[#1b1511]",
                  ].join(" ")}
                  aria-label={`Page ${pageNumber}`}
                  aria-current={currentPage === pageNumber ? "page" : undefined}
                >
                  {pageNumber}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              disabled={currentPage === pageCount}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 transition hover:border-[#1b1511] disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
