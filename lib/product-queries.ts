import { createClient } from "@/lib/supabase/server";
import {
  mapProductRow,
  products as fallbackProducts,
  type Product,
  type ProductRow,
  type ProductVariant,
  type ProductVariantSize,
} from "@/lib/products";

const productSelect =
  "id,name,slug,category,description,short_description,price,compare_at_price,quantity,sizes,colors,measurement_table,thumbnail_url,gallery_urls,status,is_featured,sku,tags,dimensions,materials,created_at";

/** Safely parse a PostgreSQL text[] or JSON array */
function safeArray<T = string>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value == null) return [];
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      return trimmed
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, "") as unknown as T)
        .filter(Boolean);
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch { /* fall through */ }
    if (trimmed) return [trimmed as unknown as T];
  }
  return [];
}

/** Fetch variants with their sizes and images for a set of product IDs */
async function fetchVariants(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productIds: string[],
): Promise<Map<string, ProductVariant[]>> {
  if (!productIds.length) return new Map();

  const { data: variants, error: vErr } = await supabase
    .from("product_variants")
    .select("*")
    .in("product_id", productIds)
    .order("sort_order");

  if (vErr || !variants?.length) return new Map();

  const variantIds = variants.map((v: { id: string }) => v.id);

  // Fetch all sizes for these variants
  const { data: sizes } = await supabase
    .from("variant_sizes")
    .select("*")
    .in("variant_id", variantIds)
    .order("size");

  // Fetch variant images from a variant_images column or use a separate approach
  // For now, we store images as a text[] column on product_variants or as a JSONB
  const sizeMap = new Map<string, ProductVariantSize[]>();
  if (sizes?.length) {
    for (const s of sizes) {
      const list = sizeMap.get(s.variant_id) ?? [];
      list.push({
        id: s.id,
        variant_id: s.variant_id,
        size: s.size,
        price: Number(s.price),
        compare_at_price: s.compare_at_price ? Number(s.compare_at_price) : null,
        stock_quantity: s.stock_quantity,
      });
      sizeMap.set(s.variant_id, list);
    }
  }

  const result = new Map<string, ProductVariant[]>();
  for (const v of variants) {
    const productVariants = result.get(v.product_id) ?? [];
    productVariants.push({
      id: v.id,
      product_id: v.product_id,
      color_name: v.color_name,
      color_code: v.color_code ?? "",
      sort_order: v.sort_order ?? 0,
      images: safeArray<string>(v.images),
      sizes: sizeMap.get(v.id) ?? [],
    });
    result.set(v.product_id, productVariants);
  }

  return result;
}

export async function getPublishedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return fallbackProducts;
  }

  const products = (data as ProductRow[]).map(mapProductRow);

  // Fetch variants for all products
  const variantMap = await fetchVariants(
    supabase,
    products.map((p) => p.id),
  );

  return products.map((p) => ({
    ...p,
    variants: variantMap.get(p.id),
  }));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!error && data) {
    const product = mapProductRow(data as ProductRow);

    // Fetch variants for this product
    const variantMap = await fetchVariants(supabase, [product.id]);
    const variants = variantMap.get(product.id);

    return {
      ...product,
      variants,
    };
  }

  return fallbackProducts.find((product) => product.id === slug || product.slug === slug) ?? null;
}

export async function getRelatedPublishedProducts(product: Product): Promise<Product[]> {
  const products = await getPublishedProducts();
  return products
    .filter((item) => item.id !== product.id && item.category === product.category)
    .concat(products.filter((item) => item.id !== product.id && item.category !== product.category))
    .slice(0, 4);
}
