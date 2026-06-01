import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import SignupForm from "./signup-form";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/account");
  }

  return <SignupForm />;
}
