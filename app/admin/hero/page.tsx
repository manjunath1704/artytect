import { redirect } from "next/navigation";

import { AdminLayout } from "../admin-layout";
import HeroManager from "./hero-manager";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HeroPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: hero } = await supabase
    .from("hero_sections")
    .select("id, title, subtitle, button_label, button_href, desktop_video_url, mobile_video_url, poster_url, scroll_target")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <HeroManager
        initialUserEmail={data.user.email ?? ""}
        initialHero={{
          id: hero?.id ? String(hero.id) : undefined,
          title: hero?.title || "Slow living,\nsculpted.",
          subtitle: hero?.subtitle || "Earthy pottery shaped for everyday rituals.",
          button_label: hero?.button_label || "Shop now",
          button_href: hero?.button_href || "/products",
          desktop_video_url: hero?.desktop_video_url || "/videos/hero.mp4",
          mobile_video_url: hero?.mobile_video_url || "/videos/hero-a-mobile.mp4",
          poster_url: hero?.poster_url || "/images/gallery/pexels-rdne-8903259.jpg",
          scroll_target: hero?.scroll_target || "#collections",
        }}
      />
    </AdminLayout>
  );
}
