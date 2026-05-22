import { redirect } from "next/navigation";

import CreateAboutSectionsForm from "../create-about-sections-form";
import { AdminLayout } from "../admin-layout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CreateAboutSectionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { count } = await supabase
    .from("about_sections")
    .select("*", { count: "exact", head: true });

  if ((count ?? 0) > 0) {
    redirect("/admin/about-sections");
  }

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <CreateAboutSectionsForm />
    </AdminLayout>
  );
}
