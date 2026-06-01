import { redirect } from "next/navigation";

import { AdminLayout } from "@/app/admin/admin-layout";
import { createClient } from "@/lib/supabase/server";
import SettingsManager from "./settings-manager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const { data } = await supabase.from("admin_settings").select("value").eq("key", "payment_qr").maybeSingle();

  return (
    <AdminLayout userEmail={userData.user.email ?? ""}>
      <SettingsManager initialQrUrl={(data?.value as { url?: string } | null)?.url ?? ""} />
    </AdminLayout>
  );
}
