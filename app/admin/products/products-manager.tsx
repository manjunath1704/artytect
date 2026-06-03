"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { AppSelect, type SelectOption } from "@/components/ui/app-select";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { GalleryUploader } from "@/components/ui/gallery-uploader";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Pagination } from "@/components/ui/pagination";
import { fixedSizes, mapProductRow, slugifyProductName, type MeasurementRow, type ProductRow } from "@/lib/products";
import { formatPrice } from "@/lib/whatsapp";

const inputClassName =
  "mt-2 w-full rounded-[24px] border border-[#d9ccbc] bg-white px-4 py-3 text-sm text-[#1b1511] outline-none transition placeholder:text-[#a69280] focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20";

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

const emptyForm = {
  id: "",
  name: "",
  slug: "",
  category: "",
  subcategory: "",
  description: "",
  short_description: "",
  price: "",
  quantity: "",
  colors: "",
  status: "draft",
  thumbnail_url: "",
  gallery_urls: [] as string[],
  measurement_table: [
    { label: "S",  height: "", width: "", length: "" },
    { label: "M",  height: "", width: "", length: "" },
    { label: "L",  height: "", width: "", length: "" },
    { label: "XL", height: "", width: "", length: "" },
  ] as MeasurementRow[],
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
  const [subcategoryOptions, setSubcategoryOptions] = useState<SelectOption[]>([]);
  const [allCategories, setAllCategories] = useState<{ id: string; title: string; slug: string; parent_category_id: string | null }[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: { categories: { id: string; title: string; slug: string; parent_category_id: string | null }[] }) => {
        const categories = data.categories ?? [];
        setAllCategories(categories);
        
        // Parent categories (no parent_category_id)
        const parents = categories.filter((cat) => !cat.parent_category_id);
        setCategoryOptions(
          parents.map((cat) => ({
            value: cat.title,
            label: cat.title,
          }))
        );
      })
      .catch(() => {/* silently ignore — category select will just be empty */});
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (!form.category) {
      setSubcategoryOptions([]);
      return;
    }
    
    const selectedParent = allCategories.find((cat) => cat.title === form.category);
    if (!selectedParent) {
      setSubcategoryOptions([]);
      return;
    }
    
    const children = allCategories.filter((cat) => cat.parent_category_id === selectedParent.id);
    setSubcategoryOptions(
      children.map((cat) => ({
        value: cat.title,
        label: cat.title,
      }))
    );
  }, [form.category, allCategories]);

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

  const openEdit = (product: ProductRow) => {
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
      thumbnail_url: product.thumbnail_url ?? "",
      gallery_urls: toArray(product.gallery_urls),
      measurement_table: product.measurement_table?.length
        ? product.measurement_table
        : emptyForm.measurement_table,
    });
    setThumbnail(null);
    setGallery([]);
    setFormOpen(true);
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
    if (!form.name || !form.category || !form.description || !form.price) {
      toast.error("Name, category, description, and price are required.");
      return;
    }
    if (!form.id && !thumbnail) {
      toast.error("Upload a thumbnail image.");
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
      formData.append("measurement_table", JSON.stringify(form.measurement_table));
      formData.append("thumbnail_url", form.thumbnail_url);
      formData.append("existing_gallery", JSON.stringify(form.gallery_urls));
      if (thumbnail) formData.append("thumbnail", thumbnail);
      gallery.forEach((file) => formData.append("gallery", file));

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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[32px] bg-white p-6 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">Product management</p>
            <h1 className="mt-2 text-4xl tracking-[-0.04em] text-[#1b1511]">Products</h1>
          </div>
          <button onClick={openCreate} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>

        <div className="mt-6 rounded-[32px] bg-white p-5 shadow-sm">
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
        </div>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div className="mx-auto my-8 max-w-4xl rounded-[32px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold tracking-[-0.03em]">{form.id ? "Edit product" : "Create product"}</h2>
              <button onClick={() => setFormOpen(false)} className="grid h-10 w-10 place-items-center rounded-full border border-[#d9ccbc]"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Product name", "text"],
                ["slug", "Slug", "text"],
                ["colors", "Colors (comma separated)", "text"],
              ].map(([key, label, type]) => (
                <label key={key} className="block">
                  <span className="text-sm font-medium text-[#352a21]">{label}</span>
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
                    className={inputClassName}
                  />
                </label>
              ))}

              {/* Price — numbers only */}
              <label className="block">
                <span className="text-sm font-medium text-[#352a21]">Price (₹)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((c) => ({ ...c, price: e.target.value }))}
                  onKeyDown={(e) => { if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault(); }}
                  className={inputClassName}
                  placeholder="0"
                />
              </label>

              {/* Quantity — integers only */}
              <label className="block">
                <span className="text-sm font-medium text-[#352a21]">Quantity</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.quantity}
                  onChange={(e) => setForm((c) => ({ ...c, quantity: e.target.value }))}
                  onKeyDown={(e) => { if (["-", "e", "E", "+", "."].includes(e.key)) e.preventDefault(); }}
                  className={inputClassName}
                  placeholder="0"
                />
              </label>

              {/* Category — driven by /api/categories */}
              <label className="block">
                <span className="text-sm font-medium text-[#352a21]">Category</span>
                <div className="mt-2">
                  <AppSelect
                    instanceId="product-form-category"
                    value={categoryOptions.find((opt) => opt.value === form.category) ?? null}
                    options={categoryOptions}
                    onChange={(opt) => {
                      setForm((current) => ({ ...current, category: opt?.value ?? "", subcategory: "" }));
                    }}
                    placeholder={categoryOptions.length ? "Select category…" : "Loading…"}
                    isClearable
                  />
                </div>
              </label>

              {/* Subcategory — shown only when category is selected */}
              <label className="block">
                <span className="text-sm font-medium text-[#352a21]">Subcategory (Optional)</span>
                <div className="mt-2">
                  <AppSelect
                    instanceId="product-form-subcategory"
                    value={subcategoryOptions.find((opt) => opt.value === form.subcategory) ?? null}
                    options={subcategoryOptions}
                    onChange={(opt) =>
                      setForm((current) => ({ ...current, subcategory: opt?.value ?? "" }))
                    }
                    placeholder={
                      !form.category
                        ? "Select category first"
                        : subcategoryOptions.length
                        ? "Select subcategory…"
                        : "No subcategories"
                    }
                    isDisabled={!form.category || !subcategoryOptions.length}
                    isClearable
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#352a21]">Publish status</span>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className={inputClassName}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <div className="text-sm text-[#665b4f]">
                <span className="font-medium text-[#352a21]">Sizes</span>
                <div className="mt-2 flex gap-2">{fixedSizes.map((size) => <span key={size} className="rounded-full border border-[#d9ccbc] px-3 py-2">{size}</span>)}</div>
              </div>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-[#352a21]">Short description</span>
                <input value={form.short_description} onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))} className={inputClassName} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-medium text-[#352a21]">Description</span>
                <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} rows={4} className={inputClassName} />
              </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ImageUploader
                label="Thumbnail image"
                file={thumbnail}
                onChange={setThumbnail}
                onRemove={() => setThumbnail(null)}
                hint={form.thumbnail_url ? "Current image kept unless replaced." : undefined}
                required={!form.id}
              />
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

            <div className="mt-6 flex justify-end">
              <button disabled={saving} onClick={saveProduct} className="inline-flex h-12 items-center gap-2 rounded-full bg-[#1b1511] px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save product
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <DeleteConfirmDialog open={!!deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={deleteProduct} loading={deleting} itemName={deleteTarget?.name} title="Delete product" />
    </div>
  );
}
