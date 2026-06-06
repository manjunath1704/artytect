import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayout } from "../admin-layout";
import FAQsManager from "./faqs-manager";

export const dynamic = "force-dynamic";

export default async function AdminFAQsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <AdminLayout userEmail={user.email || ""}>
      <FAQsManager initialUserEmail={user.email || ""} />
    </AdminLayout>
  );
}
