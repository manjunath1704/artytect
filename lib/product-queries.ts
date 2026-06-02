import { createClient } from "@/lib/supabase/server";
import { mapProductRow, products as fallbackProducts, type Product, type ProductRow } from "@/lib/products";

const productSelect =
  "id,name,slug,category,description,short_description,price,compare_at_price,quantity,sizes,colors,measurement_table,thumbnail_url,gallery_urls,status,sku,tags,dimensions,materials,created_at";

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

  return (data as ProductRow[]).map(mapProductRow);
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
    return mapProductRow(data as ProductRow);
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
