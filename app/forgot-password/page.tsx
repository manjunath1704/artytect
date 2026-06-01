import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import ForgotPasswordForm from "./forgot-password-form";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/account");
  }

  return <ForgotPasswordForm />;
}
