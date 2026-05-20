import { redirect } from "next/navigation";

import AdminPanel from "./admin-panel";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  // Fetch categories count
  const { count } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  return (
    <AdminPanel
      initialUserEmail={data.user.email ?? ""}
      categoriesCount={count || 0}
    />
  );
}
