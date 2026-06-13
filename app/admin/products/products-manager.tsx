"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import Select from "react-select";

import { AppSelect, type SelectOption } from "@/components/ui/app-select";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { GalleryUploader } from "@/components/ui/gallery-uploader";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Pagination } from "@/components/ui/pagination";
import { fixedSizes, mapProductRow, slugifyProductName, type MeasurementRow, type ProductRow, type ProductVariant } from "@/lib/products";
import { formatPrice } from "@/lib/whatsapp";

/**
 * Supabase can return postgres array fields as:
 *  - a real JS array  → use as-is
 *  - a JSON string    → parse it
 *  - a PG literal     → "{val1,val2}" → split on commas
 *  - null / undefined → return []
 */
function toArray<T = string>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value == null) return [];
  if (typeof value === "string") {
    const trimmed = value.trim();
    // PostgreSQL array literal: {val1,"val2"}
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, "") as unknown as T)
        .filter(Boolean);
    }
    // JSON array string
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch { /* fall through */ }
    // Single non-empty value
    if (trimmed) return [trimmed as unknown as T];
  }
  return [];
}

const statusOptions: SelectOption[] = [
  { value: "all", label: "All status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const sortOptions: SelectOption[] = [
  { value: "created-desc", label: "Newest first" },
  { value: "created-asc", label: "Oldest first" },
  { value: "price-asc", label: "Price low to high" },
  { value: "price-desc", label: "Price high to low" },
  { value: "name-asc", label: "Name A-Z" },
];

type SizeRow = {
  size: string;
  price: string;
  compareAtPrice: string;
  stockQuantity: string;
};

type VariantFormRow = {
  id?: string;
  colorName: string;
  colorCode: string;
  images: string[];
  newImageFiles: File[];
  sizes: SizeRow[];
};

const emptyVariantRow = (): VariantFormRow => ({
  colorName: "",
  colorCode: "#000000",
  images: [],
  newImageFiles: [],
  sizes: [
    { size: "S", price: "", compareAtPrice: "", stockQuantity: "" },
    { size: "M", price: "", compareAtPrice: "", stockQuantity: "" },
    { size: "L", price: "", compareAtPrice: "", stockQuantity: "" },
    { size: "XL", price: "", compareAtPrice: "", stockQuantity: "" },
  ],
});

const emptyForm = {
  id: "",
  name: "",
  slug: "",
  category: "", // This will store the child category title
  description: "",
  short_description: "",
  price: "",
  quantity: "",
  colors: "",
  status: "draft",
  is_featured: false,
  thumbnail_url: "",
  gallery_urls: [] as string[],
  measurement_table: [
    { label: "S",  height: "", width: "", length: "" },
    { label: "M",  height: "", width: "", length: "" },
    { label: "L",  height: "", width: "", length: "" },
    { label: "XL", height: "", width: "", length: "" },
  ] as MeasurementRow[],
  variants: [] as VariantFormRow[],
};

export default function ProductsManager({ initialProducts }: { initialProducts: ProductRow[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("created-desc");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const pageSize = 10;

  // ── fetch categories from API ─────────────────────────────────────────────
  // Loads parent categories and subcategories dynamically
  const [categoryOptions, setCategoryOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: { categories: { id: string; title: string; slug: string; parent_category_id: string | null }[] }) => {
        const categories = data.categories ?? [];
        
        // Build hierarchical category options
        // Group categories by parent
        const parents = categories.filter((cat) => !cat.parent_category_id);
        const childrenMap = new Map<string, typeof categories>();
        
        categories.forEach((cat) => {
          if (cat.parent_category_id) {
            const siblings = childrenMap.get(cat.parent_category_id) || [];
            siblings.push(cat);
            childrenMap.set(cat.parent_category_id, siblings);
          }
        });
        
        // Create flat list with indented child categories
        const options: SelectOption[] = [];
        parents.forEach((parent) => {
          // Add parent as optgroup label (disabled)
          options.push({
            value: `parent-${parent.id}`,
            label: parent.title,
            isDisabled: true,
          });
          
          // Add children as selectable options
          const children = childrenMap.get(parent.id) || [];
          children.forEach((child) => {
            options.push({
              value: child.title, // Store child category title
              label: `  └─ ${child.title}`, // Indented display
            });
          });
        });
        
        setCategoryOptions(options);
      })
      .catch(() => {/* silently ignore — category select will just be empty */});
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return [...products]
      .filter((product) => {
        const matchesQuery =
          !normalized ||
          [product.name, product.category, product.slug].join(" ").toLowerCase().includes(normalized);
        const matchesStatus = status === "all" || product.status === status;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === "created-asc") return a.created_at.localeCompare(b.created_at);
        if (sort === "price-asc") return Number(a.price) - Number(b.price);
        if (sort === "price-desc") return Number(b.price) - Number(a.price);
        if (sort === "name-asc") return a.name.localeCompare(b.name);
        return b.created_at.localeCompare(a.created_at);
      });
  }, [products, query, sort, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setForm(emptyForm);
    setThumbnail(null);
    setGallery([]);
    setFormOpen(true);
  };

  const openEdit = async (product: ProductRow) => {
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      description: product.description ?? "",
      short_description: product.short_description ?? "",
      price: String(product.price),
      quantity: String(product.quantity ?? 0),
      colors: toArray(product.colors).join(", "),
      status: product.status,
      is_featured: product.is_featured ?? false,
      thumbnail_url: product.thumbnail_url ?? "",
      gallery_urls: toArray(product.gallery_urls),
      measurement_table: product.measurement_table?.length
        ? product.measurement_table
        : emptyForm.measurement_table,
      variants: [],
    });
    setThumbnail(null);
    setGallery([]);
    setFormOpen(true);

    // Fetch existing variants
    try {
      const resp = await fetch(`/api/admin/products/${product.id}/variants`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.variants?.length) {
          setForm((current) => ({
            ...current,
            variants: data.variants.map((v: ProductVariant) => ({
              id: v.id,
              colorName: v.color_name,
              colorCode: v.color_code || "#000000",
              images: v.images || [],
              newImageFiles: [],
              sizes: v.sizes?.length ? v.sizes.map((s) => ({
                size: s.size,
                price: String(s.price),
                compareAtPrice: s.compare_at_price ? String(s.compare_at_price) : "",
                stockQuantity: String(s.stock_quantity),
              })) : emptyVariantRow().sizes,
            })),
          }));
        }
      }
    } catch { /* ignore */ }
  };

  const updateMeasurement = (index: number, key: keyof MeasurementRow, value: string) => {
    setForm((current) => ({
      ...current,
      measurement_table: current.measurement_table.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    }));
  };

  const saveProduct = async () => {
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.category.trim()) {
      toast.error("Product category is required");
      return;
    }
    if (!form.description.trim()) {
      toast.error("Product description is required");
      return;
    }
    if (!form.short_description.trim()) {
      toast.error("Short description is required");
      return;
    }
    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!form.id && !thumbnail) {
      toast.error("Thumbnail image is required for new products");
      return;
    }

    setSaving(true);
    const toastId = toast.loading(form.id ? "Updating product..." : "Creating product...");
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("slug", form.slug || slugifyProductName(form.name));
      formData.append("category", form.category);
      formData.append("description", form.description);
      formData.append("short_description", form.short_description || form.description);
      formData.append("price", form.price);
      formData.append("quantity", form.quantity || "0");
      formData.append("colors", form.colors);
      formData.append("status", form.status);
      formData.append("is_featured", String(form.is_featured));
      formData.append("measurement_table", JSON.stringify(form.measurement_table));
      formData.append("thumbnail_url", form.thumbnail_url);
      formData.append("existing_gallery", JSON.stringify(form.gallery_urls));
      if (thumbnail) formData.append("thumbnail", thumbnail);
      gallery.forEach((file) => formData.append("gallery", file));

      // Append variant data
      const variantPayload = form.variants.map((v) => ({
        id: v.id,
        colorName: v.colorName,
        colorCode: v.colorCode,
        sizes: v.sizes,
      }));
      formData.append("variants", JSON.stringify(variantPayload));

      // Append variant image files
      form.variants.forEach((v, vi) => {
        v.newImageFiles.forEach((file) => {
          formData.append(`variant_images_${vi}`, file);
        });
        // Append existing images list for tracking
        formData.append(`existing_variant_images_${vi}`, JSON.stringify(v.images));
      });

      const response = await fetch(form.id ? `/api/admin/products/${form.id}` : "/api/admin/products", {
        method: form.id ? "PUT" : "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to save product.");
      setProducts((current) =>
        form.id
          ? current.map((product) => (product.id === form.id ? result.product : product))
          : [result.product, ...current],
      );
      toast.success(form.id ? "Product updated." : "Product created.", { id: toastId });
      setFormOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save product.", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error ?? "Unable to delete product.");
      setProducts((current) => current.filter((product) => product.id !== deleteTarget.id));
      toast.success("Product deleted.");
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete product.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] bg-white p-6 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">Product management</p>
            <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">Products</h1>
          </div>
          <button onClick={openCreate} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <Plus className="h-4 w-4" /> Add product
          </button>
        </section>

        <AnimatePresence>
          {formOpen && (
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 18 }}
              className="mt-6 rounded-[32px] bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl tracking-[-0.03em] text-[#1b1511]">{form.id ? "Edit product" : "Create product"}</h2>
                  <p className="mt-2 text-sm text-[#665b4f]">
                    {form.id ? "Update product details below." : "Slug is generated from the product name until you edit an existing product."}
                  </p>
                </div>
                <button
                  onClick={() => setFormOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5eee4] text-[#1b1511] transition hover:bg-[#e8ddd1]"
                  aria-label="Close form"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="grid gap-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      ["name", "Product name", "text"],
                      ["slug", "Slug", "text"],
                      ["colors", "Colors (comma separated)", "text"],
                    ].map(([key, label, type]) => (
                      <label key={key} className="block">
                        <span className="text-sm block font-medium text-[#352a21]">{label}</span>
                        <input
                          type={type}
                          value={form[key as keyof typeof form] as string}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              [key]: event.target.value,
                              slug:
                                key === "name" && !current.id
                                  ? slugifyProductName(event.target.value)
                                  : current.slug,
                            }))
                          }
                          className="w-full mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                        />
                      </label>
                    ))}
                  </div>

                  {/* Price — numbers only */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-[#352a21] block">Price (₹)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
                        onKeyDown={(e) => { if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault(); }}
                        className="mt-2 h-11 w-full rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                        placeholder="0"
                      />
                    </label>

                    {/* Quantity — integers only */}
                    <label className="block">
                      <span className="block text-sm font-medium text-[#352a21]">Quantity</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={form.quantity}
                        onChange={(e) => setForm((c) => ({ ...c, quantity: e.target.value }))}
                        onKeyDown={(e) => { if (["-", "e", "E", "+", "."].includes(e.key)) e.preventDefault(); }}
                        className="w-full mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
                        placeholder="0"
                      />
                    </label>
                  </div>

                  {/* Category — hierarchical selection with child categories only */}
                  <label className="block">
                    <span className="text-sm font-medium text-[#352a21]">Category (Child Category)</span>
                    <p className="mt-1 text-xs text-[#665b4f]">Select a child category. Parent categories are for grouping only.</p>
                    <div className="mt-2">
                      <AppSelect
                        instanceId="product-form-category"
                        value={categoryOptions.find((opt) => opt.value === form.category) ?? null}
                        options={categoryOptions}
                        onChange={(opt) => {
                          // Prevent selecting parent categories (disabled options)
                          if (opt && !opt.isDisabled) {
                            setForm((current) => ({ ...current, category: opt.value }));
                          }
                        }}
                        placeholder={categoryOptions.length ? "Select child category…" : "Loading…"}
                        isClearable
                        isOptionDisabled={(option) => option.isDisabled === true}
                      />
                    </div>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-sm font-medium text-[#352a21]">Publish status</span>
                      <Select
                        options={[
                          { value: "draft", label: "Draft" },
                          { value: "published", label: "Published" },
                        ]}
                        value={{ value: form.status, label: form.status.charAt(0).toUpperCase() + form.status.slice(1) }}
                        onChange={(option) => {
                          if (option) setForm((current) => ({ ...current, status: option.value }));
                        }}
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: "32px",
                            border: "1px solid #d9ccbc",
                            backgroundColor: "white",
                            padding: "6px 12px",
                            fontSize: "14px",
                            outline: "none",
                            transition: "all 0.2s",
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: "#b38d67",
                            },
                            "&:focus": {
                              borderColor: "#b38d67",
                              boxShadow: "0 0 0 4px rgba(215, 182, 139, 0.2)",
                            },
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected ? "#1b1511" : state.isFocused ? "#f5eee4" : "white",
                            color: state.isSelected ? "white" : "#1b1511",
                            padding: "10px 12px",
                            cursor: "pointer",
                          }),
                          menu: (base) => ({
                            ...base,
                            borderRadius: "12px",
                            backgroundColor: "white",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          }),
                        }}
                      />
                    </label>

                    {/* Featured checkbox */}
                    <label className="flex items-center gap-3 rounded-2xl border border-[#d9ccbc] bg-[#faf6f2] px-4 py-4">
                      <input
                        type="checkbox"
                        checked={form.is_featured}
                        onChange={(e) => setForm((c) => ({ ...c, is_featured: e.target.checked }))}
                        className="h-5 w-5 rounded border-[#d9ccbc] text-[#1b1511] focus:ring-2 focus:ring-[#b38d67] focus:ring-offset-0"
                      />
                      <div>
                        <span className="block text-sm font-medium text-[#352a21]">Featured Product</span>
                        <span className="text-xs text-[#665b4f]">Show on homepage featured section</span>
                      </div>
                    </label>
                  </div>

                  <div className="text-sm text-[#665b4f]">
                    <span className="font-medium text-[#352a21]">Sizes</span>
                    <div className="mt-2 flex gap-2">{fixedSizes.map((size) => <span key={size} className="rounded-full border border-[#d9ccbc] px-3 py-2">{size}</span>)}</div>
                  </div>

                  <label className="block">
                    <span className="text-sm font-medium text-[#352a21] block">Short description</span>
                    <input value={form.short_description} onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))} className="w-full mt-2 h-11 rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20" />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-[#352a21]">Description</span>
                    <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} className="mt-2 w-full rounded-[32px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20" />
                  </label>
                </div>

                <aside className="rounded-[32px] border border-[#e8ddd1] bg-[#fcfaf7] p-4">
                  <ImageUploader
                    label="Thumbnail image"
                    file={thumbnail}
                    onChange={setThumbnail}
                    onRemove={() => setThumbnail(null)}
                    hint={form.thumbnail_url ? "Current image kept unless replaced." : undefined}
                    required={!form.id}
                  />
                  <div className="mt-5">
                    <GalleryUploader
                      label="Product gallery"
                      hint="All product images shown in the detail view"
                      files={gallery}
                      onChange={setGallery}
                      existingUrls={form.gallery_urls}
                      onRemoveExisting={(url) =>
                        setForm((c) => ({ ...c, gallery_urls: c.gallery_urls.filter((u) => u !== url) }))
                      }
                    />
                  </div>
                </aside>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em]">Measurement table</h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[540px] text-sm">
                    <thead>
                      <tr>
                        {["Size", "Height", "Width", "Length"].map((col) => (
                          <th key={col} className="px-1 pb-2 text-left text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7765]">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.measurement_table.map((row, index) => (
                        <tr key={index}>
                          {/* Size label — fixed, read-only */}
                          <td className="p-1">
                            <div className="flex h-[42px] w-full items-center rounded-2xl border border-[#e8ddd1] bg-[#fcfaf7] px-3 text-sm font-semibold text-[#1b1511]">
                              {row.label}
                            </div>
                          </td>
                          {(["height", "width", "length"] as const).map((key) => (
                            <td key={key} className="p-1">
                              <input
                                value={row[key]}
                                onChange={(event) => updateMeasurement(index, key, event.target.value)}
                                placeholder={`e.g. 10 cm`}
                                className="w-full rounded-2xl border border-[#d9ccbc] px-3 py-2 outline-none focus:border-[#b38d67]"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Product Variants ──────────────────────────────── */}
              <div className="mt-8 rounded-[32px] border border-[#e8ddd1] bg-[#fcfaf7] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#352a21]">Product Variants</h3>
                    <p className="mt-1 text-xs text-[#665b4f]">
                      Add color variants with size-specific pricing and stock. Each color can have its own images and prices.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((c) => ({
                        ...c,
                        variants: [...c.variants, emptyVariantRow()],
                      }))
                    }
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[#d9ccbc] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#f5eee4]"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Color Variant
                  </button>
                </div>

                {form.variants.length === 0 && (
                  <p className="mt-4 text-sm text-[#a69280]">
                    No variants added. Products without variants will use the base price and gallery images.
                  </p>
                )}

                <div className="mt-5 space-y-6">
                  {form.variants.map((variant, vi) => (
                    <div
                      key={vi}
                      className="rounded-2xl border border-[#d9ccbc] bg-white p-5"
                    >
                      {/* Variant header */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={variant.colorCode || "#000000"}
                            onChange={(e) =>
                              setForm((c) => ({
                                ...c,
                                variants: c.variants.map((v, i) =>
                                  i === vi ? { ...v, colorCode: e.target.value } : v,
                                ),
                              }))
                            }
                            className="h-10 w-10 cursor-pointer rounded-xl border border-[#d9ccbc]"
                          />
                          <input
                            type="text"
                            value={variant.colorCode || "#000000"}
                            onChange={(e) => {
                              const val = e.target.value;
                              // Allow typing hex codes with or without #
                              const hex = val.startsWith("#") ? val : `#${val}`;
                              if (/^#[0-9A-Fa-f]{0,6}$/.test(hex)) {
                                setForm((c) => ({
                                  ...c,
                                  variants: c.variants.map((v, i) =>
                                    i === vi ? { ...v, colorCode: hex } : v,
                                  ),
                                }));
                              }
                            }}
                            placeholder="#000000"
                            className="h-10 w-24 rounded-full border border-[#d9ccbc] bg-white px-3 text-sm font-mono outline-none focus:border-[#b38d67]"
                          />
                          <input
                            type="text"
                            value={variant.colorName}
                            onChange={(e) =>
                              setForm((c) => ({
                                ...c,
                                variants: c.variants.map((v, i) =>
                                  i === vi ? { ...v, colorName: e.target.value } : v,
                                ),
                              }))
                            }
                            placeholder="Color name (e.g. Black)"
                            className="h-10 w-48 rounded-full border border-[#d9ccbc] bg-white px-4 text-sm outline-none focus:border-[#b38d67]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((c) => ({
                              ...c,
                              variants: c.variants.filter((_, i) => i !== vi),
                            }))
                          }
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-200 px-3 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>

                      {/* Variant images */}
                      <div className="mt-4">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7765]">
                          Images for {variant.colorName || "this color"}
                        </p>

                        {/* Existing uploaded images */}
                        <div className="flex flex-wrap gap-3">
                          {variant.images.map((img, imgIdx) => (
                            <div key={`existing-${imgIdx}`} className="relative h-24 w-24 overflow-hidden rounded-xl border border-[#e8ddd1] bg-[#f5eee4]">
                              <Image src={img} alt="" fill sizes="96px" className="object-cover" />
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((c) => ({
                                    ...c,
                                    variants: c.variants.map((v, i) =>
                                      i === vi
                                        ? { ...v, images: v.images.filter((_, j) => j !== imgIdx) }
                                        : v,
                                    ),
                                  }))
                                }
                                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}

                          {/* New files preview */}
                          {variant.newImageFiles.map((f, fi) => (
                            <div key={`new-${fi}`} className="relative h-24 w-24 overflow-hidden rounded-xl border border-[#d9ccbc] bg-[#f5eee4]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={URL.createObjectURL(f)}
                                alt={f.name}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5">
                                <p className="truncate text-[8px] text-white">{f.name}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((c) => ({
                                    ...c,
                                    variants: c.variants.map((v, i) =>
                                      i === vi
                                        ? { ...v, newImageFiles: v.newImageFiles.filter((_, j) => j !== fi) }
                                        : v,
                                    ),
                                  }))
                                }
                                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}

                          {/* Drag & drop zone */}
                          <label
                            className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#d9ccbc] bg-[#faf6f2] text-[#8a7765] transition hover:border-[#b38d67] hover:bg-[#f5eee4]"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.currentTarget.classList.add("border-[#b38d67]", "bg-[#f5eee4]");
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.currentTarget.classList.remove("border-[#b38d67]", "bg-[#f5eee4]");
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              e.currentTarget.classList.remove("border-[#b38d67]", "bg-[#f5eee4]");
                              const files = Array.from(e.dataTransfer.files).filter((f) =>
                                f.type.startsWith("image/"),
                              );
                              if (files.length) {
                                setForm((c) => ({
                                  ...c,
                                  variants: c.variants.map((v, i) =>
                                    i === vi
                                      ? { ...v, newImageFiles: [...v.newImageFiles, ...files] }
                                      : v,
                                  ),
                                }));
                              }
                            }}
                          >
                            <Plus className="h-5 w-5" />
                            <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider">Drop or click</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                if (!files.length) return;
                                setForm((c) => ({
                                  ...c,
                                  variants: c.variants.map((v, i) =>
                                    i === vi
                                      ? { ...v, newImageFiles: [...v.newImageFiles, ...files] }
                                      : v,
                                  ),
                                }));
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </div>

                        {variant.newImageFiles.length > 0 && (
                          <p className="mt-2 text-[10px] text-[#665b4f]">
                            {variant.newImageFiles.length} new image(s) ready to upload
                          </p>
                        )}
                      </div>

                      {/* Size variants */}
                      <div className="mt-5">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a7765]">
                          Sizes & Pricing
                        </p>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[500px] text-sm">
                            <thead>
                              <tr className="text-[10px] uppercase tracking-[0.2em] text-[#8a7765]">
                                <th className="px-2 pb-2 text-left">Size</th>
                                <th className="px-2 pb-2 text-left">Price (₹)</th>
                                <th className="px-2 pb-2 text-left">Compare At (₹)</th>
                                <th className="px-2 pb-2 text-left">Stock</th>
                                <th className="px-2 pb-2"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {variant.sizes.map((sizeRow, si) => (
                                <tr key={si}>
                                  <td className="p-1">
                                    <select
                                      value={sizeRow.size}
                                      onChange={(e) =>
                                        setForm((c) => ({
                                          ...c,
                                          variants: c.variants.map((v, i) =>
                                            i === vi
                                              ? {
                                                  ...v,
                                                  sizes: v.sizes.map((s, j) =>
                                                    j === si ? { ...s, size: e.target.value } : s,
                                                  ),
                                                }
                                              : v,
                                          ),
                                        }))
                                      }
                                      className="h-9 rounded-xl border border-[#d9ccbc] bg-white px-2 text-sm outline-none focus:border-[#b38d67]"
                                    >
                                      {fixedSizes.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="p-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={sizeRow.price}
                                      onChange={(e) =>
                                        setForm((c) => ({
                                          ...c,
                                          variants: c.variants.map((v, i) =>
                                            i === vi
                                              ? {
                                                  ...v,
                                                  sizes: v.sizes.map((s, j) =>
                                                    j === si ? { ...s, price: e.target.value } : s,
                                                  ),
                                                }
                                              : v,
                                          ),
                                        }))
                                      }
                                      placeholder="0"
                                      className="h-9 w-24 rounded-xl border border-[#d9ccbc] bg-white px-2 text-sm outline-none focus:border-[#b38d67]"
                                    />
                                  </td>
                                  <td className="p-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={sizeRow.compareAtPrice}
                                      onChange={(e) =>
                                        setForm((c) => ({
                                          ...c,
                                          variants: c.variants.map((v, i) =>
                                            i === vi
                                              ? {
                                                  ...v,
                                                  sizes: v.sizes.map((s, j) =>
                                                    j === si ? { ...s, compareAtPrice: e.target.value } : s,
                                                  ),
                                                }
                                              : v,
                                          ),
                                        }))
                                      }
                                      placeholder="Optional"
                                      className="h-9 w-24 rounded-xl border border-[#d9ccbc] bg-white px-2 text-sm outline-none focus:border-[#b38d67]"
                                    />
                                  </td>
                                  <td className="p-1">
                                    <input
                                      type="number"
                                      min="0"
                                      step="1"
                                      value={sizeRow.stockQuantity}
                                      onChange={(e) =>
                                        setForm((c) => ({
                                          ...c,
                                          variants: c.variants.map((v, i) =>
                                            i === vi
                                              ? {
                                                  ...v,
                                                  sizes: v.sizes.map((s, j) =>
                                                    j === si ? { ...s, stockQuantity: e.target.value } : s,
                                                  ),
                                                }
                                              : v,
                                          ),
                                        }))
                                      }
                                      placeholder="0"
                                      className="h-9 w-24 rounded-xl border border-[#d9ccbc] bg-white px-2 text-sm outline-none focus:border-[#b38d67]"
                                    />
                                  </td>
                                  <td className="p-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setForm((c) => ({
                                          ...c,
                                          variants: c.variants.map((v, i) =>
                                            i === vi
                                              ? { ...v, sizes: v.sizes.filter((_, j) => j !== si) }
                                              : v,
                                          ),
                                        }))
                                      }
                                      className="grid h-8 w-8 place-items-center rounded-full text-red-400 transition hover:bg-red-50 hover:text-red-600"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((c) => ({
                              ...c,
                              variants: c.variants.map((v, i) =>
                                i === vi
                                  ? {
                                      ...v,
                                      sizes: [
                                        ...v.sizes,
                                        { size: "S", price: "", compareAtPrice: "", stockQuantity: "" },
                                      ],
                                    }
                                  : v,
                              ),
                            }))
                          }
                          className="mt-2 inline-flex h-8 items-center gap-1.5 rounded-full border border-[#d9ccbc] px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#665b4f] transition hover:bg-[#f5eee4]"
                        >
                          <Plus className="h-3 w-3" /> Add Size
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setFormOpen(false)}
                  className="inline-flex h-12 items-center gap-2 rounded-full border border-[#d9ccbc] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#f5eee4]"
                >
                  Cancel
                </button>
                <button disabled={saving} onClick={saveProduct} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {form.id ? "Save changes" : "Create product"}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="mt-6 rounded-[32px] bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
            <label className="relative block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search products" className="h-12 w-full rounded-full border border-[#d9ccbc] pl-11 pr-4 text-sm outline-none" />
            </label>
            <AppSelect value={statusOptions.find((option) => option.value === status)} options={statusOptions} onChange={(option) => { setStatus(option?.value ?? "all"); setPage(1); }} instanceId="product-admin-status" />
            <AppSelect value={sortOptions.find((option) => option.value === sort)} options={sortOptions} onChange={(option) => setSort(option?.value ?? "created-desc")} instanceId="product-admin-sort" />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.2em] text-[#8a7765]">
                <tr>
                  {["Image", "Name", "Category", "Price", "Stock", "Status", "Created", "Actions"].map((head) => (
                    <th key={head} className="border-b border-[#eadfd4] px-3 py-3">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const product = mapProductRow(row);
                  return (
                    <tr key={row.id}>
                      <td className="border-b border-[#f1e7dc] px-3 py-3">
                        <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-[#f5eee4]">
                          <Image src={product.images[0]} alt={row.name} fill sizes="56px" className="object-cover" />
                        </div>
                      </td>
                      <td className="border-b border-[#f1e7dc] px-3 py-3 font-semibold">{row.name}</td>
                      <td className="border-b border-[#f1e7dc] px-3 py-3">{row.category}</td>
                      <td className="border-b border-[#f1e7dc] px-3 py-3">{formatPrice(Number(row.price))}</td>
                      <td className="border-b border-[#f1e7dc] px-3 py-3">{row.quantity ?? 0}</td>
                      <td className="border-b border-[#f1e7dc] px-3 py-3 capitalize">{row.status}</td>
                      <td className="border-b border-[#f1e7dc] px-3 py-3">{new Date(row.created_at).toLocaleDateString()}</td>
                      <td className="border-b border-[#f1e7dc] px-3 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(row)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ccbc]"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => setDeleteTarget(row)} className="grid h-9 w-9 place-items-center rounded-full border border-[#d9ccbc] text-red-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-6"><Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} /></div>
        </section>
      </div>

      <DeleteConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={deleteProduct} loading={deleting} itemName={deleteTarget?.name} title="Delete product" />
    </div>
  );
}
