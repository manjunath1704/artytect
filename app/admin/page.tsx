import { redirect } from "next/navigation";

import AdminPanel from "./admin-panel";
import { createClient } from "@/lib/supabase/server";

type CategoryListItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  hoverThumbnailUrl: string;
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  // Fetch categories directly from Supabase instead of Prisma
  const { data: categoriesData, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  const categories: CategoryListItem[] = error ? [] : (categoriesData || []).map((cat: {
    id: number;
    category_name: string;
    category_slug: string;
    category_description: string;
    category_thumbnail: string;
    category_hover_thumbnail: string;
  }) => ({
    id: String(cat.id),
    title: cat.category_name || '',
    slug: cat.category_slug || '',
    description: cat.category_description || '',
    thumbnailUrl: cat.category_thumbnail || '',
    hoverThumbnailUrl: cat.category_hover_thumbnail || cat.category_thumbnail || '',
  }));

  return (
    <AdminPanel
      initialUserEmail={data.user.email ?? ""}
      initialCategories={categories.map((category) => ({
        id: category.id,
        title: category.title,
        slug: category.slug,
        description: category.description,
        thumbnail_url: category.thumbnailUrl,
        hover_thumbnail_url: category.hoverThumbnailUrl,
      }))}
    />
  );
}
