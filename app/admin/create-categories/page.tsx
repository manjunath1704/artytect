import { redirect } from "next/navigation";

import CreateCategoriesForm from "../create-categories-form";
import { AdminLayout } from "../admin-layout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ParentCategoryOption = {
  id: string;
  title: string;
};

export default async function CreateCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: parentCategoriesData } = await supabase
    .from("categories")
    .select("id, category_name, parent_category_id")
    .is("parent_category_id", null)
    .order("category_name", { ascending: true });

  const parentCategories: ParentCategoryOption[] = (parentCategoriesData || []).map((category: {
    id: string;
    category_name: string | null;
  }) => ({
    id: String(category.id),
    title: category.category_name || "Untitled category",
  }));

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <CreateCategoriesForm parentCategories={parentCategories} />
    </AdminLayout>
  );
}
