import { redirect } from "next/navigation";

import { AdminLayout } from "../admin-layout";
import PageHeroesManager from "./page-heroes-manager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function PageHeroesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: heroes } = await supabase
    .from("page_hero_sections")
    .select("*")
    .order("page_key");

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <PageHeroesManager
        initialUserEmail={data.user.email ?? ""}
        initialHeroes={heroes ?? []}
      />
    </AdminLayout>
  );
}