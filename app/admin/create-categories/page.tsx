import { redirect } from "next/navigation";

import CreateCategoriesForm from "../create-categories-form";
import { ensureCategoryThumbnailsBucket } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function CreateCategoriesPage() {
  await ensureCategoryThumbnailsBucket();

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  return <CreateCategoriesForm />;
}
