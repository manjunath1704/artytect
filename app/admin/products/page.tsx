import { redirect } from "next/navigation";

import { AdminLayout } from "@/app/admin/admin-layout";
import { createClient } from "@/lib/supabase/server";
import type { ProductRow } from "@/lib/products";
import ProductsManager from "./products-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) redirect("/admin/login");

  const { data } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminLayout userEmail={userData.user.email ?? ""}>
      <ProductsManager initialProducts={(data ?? []) as ProductRow[]} />
    </AdminLayout>
  );
}
