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

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <AdminPanel
        initialUserEmail={data.user.email ?? ""}
        categoriesCount={count || 0}
      />
    </AdminLayout>
  );
}
