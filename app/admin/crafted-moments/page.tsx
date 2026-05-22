import { redirect } from "next/navigation";

import { AdminLayout } from "../admin-layout";
import CraftedMomentsManager from "./crafted-moments-manager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CraftedMomentsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const [{ data: header }, { data: items }] = await Promise.all([
    supabase
      .from("crafted_moments_sections")
      .select("id, eyebrow, title, description")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("crafted_moments_items")
      .select("id, type, title, caption, media_url, poster_url, label, is_featured, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <CraftedMomentsManager
        initialUserEmail={data.user.email ?? ""}
        initialHeader={{
          id: header?.id ? String(header.id) : undefined,
          eyebrow: header?.eyebrow || "Crafted moments",
          title: header?.title || "Inside Our Pottery Studio",
          description:
            header?.description ||
            "A cinematic glimpse into the artistry, craftsmanship, and soulful process behind every handmade ceramic piece.",
        }}
        initialItems={(items || []).map((item) => ({
          id: String(item.id),
          type: item.type === "video" ? "video" : "image",
          title: item.title || "",
          caption: item.caption || "",
          media_url: item.media_url || "",
          poster_url: item.poster_url || "",
          label: item.label || "",
          is_featured: Boolean(item.is_featured),
          sort_order: Number(item.sort_order || 0),
        }))}
      />
    </AdminLayout>
  );
}
