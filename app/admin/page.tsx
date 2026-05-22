import { redirect } from "next/navigation";

import AdminPanel from "./admin-panel";
import { AdminLayout } from "./admin-layout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  const { count: testimonialsCount } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact', head: true });

  const { count: aboutSectionsCount } = await supabase
    .from('about_sections')
    .select('*', { count: 'exact', head: true });

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <AdminPanel
        initialUserEmail={data.user.email ?? ""}
        categoriesCount={count || 0}
        testimonialsCount={testimonialsCount || 0}
        aboutSectionsCount={aboutSectionsCount || 0}
      />
    </AdminLayout>
  );
}
