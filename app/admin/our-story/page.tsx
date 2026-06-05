import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/app/admin/admin-layout";
import OurStoryManager from "./our-story-manager";

export const dynamic = "force-dynamic";

export default async function AdminOurStoryPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect("/admin/login");
  }

  // Fetch all data
  const [heroRes, contentRes, valuesRes, timelineRes, teamRes] = await Promise.all([
    supabase.from("our_story_hero").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("our_story_content").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("our_story_values").select("*").order("sort_order", { ascending: true }),
    supabase.from("our_story_timeline").select("*").order("sort_order", { ascending: true }),
    supabase.from("our_story_team").select("*").order("sort_order", { ascending: true }),
  ]);

  return (
    <AdminLayout userEmail={data.user.email || ""}>
      <OurStoryManager
        initialHero={heroRes.data}
        initialContent={contentRes.data}
        initialValues={valuesRes.data ?? []}
        initialTimeline={timelineRes.data ?? []}
        initialTeam={teamRes.data ?? []}
      />
    </AdminLayout>
  );
}
