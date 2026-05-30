import { redirect } from "next/navigation";

import CategoriesManager from "./categories-manager";
import { AdminLayout } from "../admin-layout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  hover_thumbnail_url: string;
  thumbnail_alt: string;
  parent_category_id: string | null;
  created_at: string;
};

type CategoriesHeader = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const [{ data: header }, { data: categoriesData, error }] = await Promise.all([
    supabase
      .from("categories_sections")
      .select("id, eyebrow, title, description")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  const categories: CategoryRow[] = error ? [] : (categoriesData || []).map((cat: {
    id: number;
    category_name: string;
    category_slug: string;
    category_description: string;
    category_thumbnail: string;
    category_hover_thumbnail: string;
    category_thumbnail_alt: string;
    parent_category_id: string | null;
    created_at: string;
  }) => ({
    id: String(cat.id),
    title: cat.category_name || '',
    slug: cat.category_slug || '',
    description: cat.category_description || '',
    thumbnail_url: cat.category_thumbnail || '',
    hover_thumbnail_url: cat.category_hover_thumbnail || cat.category_thumbnail || '',
    thumbnail_alt: cat.category_thumbnail_alt || '',
    parent_category_id: cat.parent_category_id ? String(cat.parent_category_id) : null,
    created_at: cat.created_at || '',
  }));

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <CategoriesManager
        initialUserEmail={data.user.email ?? ""}
        initialHeader={{
          id: header?.id ? String(header.id) : undefined,
          eyebrow: header?.eyebrow || "Featured collections",
          title: header?.title || "Find your everyday form",
          description:
            header?.description ||
            "Explore bowls, mugs, vases, planters, plates, and deep serving forms selected for a quiet home, tactile tables, and daily rituals.",
        } satisfies CategoriesHeader}
        initialCategories={categories}
      />
    </AdminLayout>
  );
}
