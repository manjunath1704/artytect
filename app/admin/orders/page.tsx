import { redirect } from "next/navigation";

import { AdminLayout } from "@/app/admin/admin-layout";
import { createClient } from "@/lib/supabase/server";
import OrdersManager, { type OrderRow } from "./orders-manager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });

  return (
    <AdminLayout userEmail={userData.user.email ?? ""}>
      <OrdersManager initialOrders={(data ?? []) as OrderRow[]} />
    </AdminLayout>
  );
}
