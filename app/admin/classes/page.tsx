import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminLayout } from "../admin-layout";
import ClassesManager from "./classes-manager";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <AdminLayout userEmail={user.email || ""}>
      <ClassesManager initialUserEmail={user.email || ""} />
    </AdminLayout>
  );
}
