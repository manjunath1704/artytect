import { redirect } from "next/navigation";

import ProcessManager from "./process-manager";
import { AdminLayout } from "../admin-layout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProcessPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const [{ data: header }, { data: steps }] = await Promise.all([
    supabase
      .from("process_sections")
      .select("id, eyebrow, title")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("process_steps")
      .select("id, title, description, image_url, image_alt, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <ProcessManager
        initialUserEmail={data.user.email ?? ""}
        initialHeader={{
          id: header?.id ? String(header.id) : undefined,
          eyebrow: header?.eyebrow || "The Process",
          title: header?.title || "Crafting timeless ceramics with soul",
        }}
        initialSteps={(steps || []).map((step) => ({
          id: String(step.id),
          title: step.title || "",
          description: step.description || "",
          image_url: step.image_url || "",
          image_alt: step.image_alt || "",
          sort_order: Number(step.sort_order || 0),
        }))}
      />
    </AdminLayout>
  );
}
