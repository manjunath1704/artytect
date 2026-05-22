import { redirect } from "next/navigation";

import CreateCategoriesForm from "../create-categories-form";
import { AdminLayout } from "../admin-layout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CreateCategoriesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <CreateCategoriesForm />
    </AdminLayout>
  );
}
