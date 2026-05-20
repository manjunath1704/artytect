import { redirect } from "next/navigation";

import CategoriesManager from "./categories-manager";
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
};

export default async function CategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  // Fetch categories
  const { data: categoriesData, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  const categories: CategoryRow[] = error ? [] : (categoriesData || []).map((cat: {
    id: number;
    category_name: string;
    category_slug: string;
    category_description: string;
    category_thumbnail: string;
    category_hover_thumbnail: string;
    category_thumbnail_alt: string;
  }) => ({
    id: String(cat.id),
    title: cat.category_name || '',
    slug: cat.category_slug || '',
    description: cat.category_description || '',
    thumbnail_url: cat.category_thumbnail || '',
    hover_thumbnail_url: cat.category_hover_thumbnail || cat.category_thumbnail || '',
    thumbnail_alt: cat.category_thumbnail_alt || '',
  }));

  return (
    <CategoriesManager
      initialUserEmail={data.user.email ?? ""}
      initialCategories={categories}
    />
  );
}
