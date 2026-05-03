import { redirect } from "next/navigation";

import AdminLoginForm from "./login-form";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}

