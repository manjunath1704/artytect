import { createClient } from "@supabase/supabase-js";

export type PublicPageKey = "categories" | "products" | "classes" | "blog" | "contact" | "our-story";

export type PublicPageVisibility = {
  page_key: PublicPageKey;
  label: string;
  path: string;
  is_visible: boolean;
  sort_order: number;
};

export const PUBLIC_PAGE_DEFAULTS: PublicPageVisibility[] = [
  { page_key: "categories", label: "Categories", path: "/categories", is_visible: true, sort_order: 10 },
  { page_key: "products", label: "Products", path: "/products", is_visible: true, sort_order: 20 },
  { page_key: "classes", label: "Classes", path: "/classes", is_visible: true, sort_order: 30 },
  { page_key: "blog", label: "Blog", path: "/blog", is_visible: true, sort_order: 40 },
  { page_key: "our-story", label: "Our Story", path: "/our-story", is_visible: true, sort_order: 45 },
  { page_key: "contact", label: "Contact", path: "/contact", is_visible: true, sort_order: 50 },
];

export function getPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getPublicPageVisibility(): Promise<PublicPageVisibility[]> {
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return PUBLIC_PAGE_DEFAULTS;
  }

  const { data, error } = await supabase
    .from("public_page_visibility")
    .select("page_key, label, path, is_visible, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching public page visibility:", error);
    return PUBLIC_PAGE_DEFAULTS;
  }

  const rowsByKey = new Map(
    (data ?? []).map((page) => [
      page.page_key,
      {
        page_key: page.page_key as PublicPageKey,
        label: page.label,
        path: page.path,
        is_visible: Boolean(page.is_visible),
        sort_order: Number(page.sort_order || 0),
      },
    ]),
  );

  return PUBLIC_PAGE_DEFAULTS.map((page) => rowsByKey.get(page.page_key) ?? page);
}

export async function isPublicPageVisible(pageKey: PublicPageKey): Promise<boolean> {
  const pages = await getPublicPageVisibility();
  return pages.find((page) => page.page_key === pageKey)?.is_visible ?? true;
}
