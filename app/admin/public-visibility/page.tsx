import { redirect } from "next/navigation";

import { AdminLayout } from "../admin-layout";
import { createClient } from "@/lib/supabase/server";
import VisibilityManager, { type PublicSectionVisibility } from "./visibility-manager";

export const dynamic = "force-dynamic";

const DEFAULT_SECTIONS: PublicSectionVisibility[] = [
  { section_key: "hero", label: "Hero", is_visible: true, sort_order: 10 },
  { section_key: "categories", label: "Categories", is_visible: true, sort_order: 20 },
  { section_key: "featured_products", label: "Featured Products", is_visible: true, sort_order: 30 },
  { section_key: "featured_classes", label: "Featured Classes", is_visible: true, sort_order: 40 },
  { section_key: "about", label: "About", is_visible: true, sort_order: 50 },
  { section_key: "process", label: "Process", is_visible: true, sort_order: 60 },
  { section_key: "testimonials", label: "Testimonials", is_visible: true, sort_order: 70 },
  { section_key: "crafted_moments", label: "Crafted Moments", is_visible: true, sort_order: 80 },
];

export default async function PublicVisibilityPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: visibilityData, error } = await supabase
    .from("public_section_visibility")
    .select("section_key, label, is_visible, sort_order")
    .order("sort_order", { ascending: true });

  const sections: PublicSectionVisibility[] =
    error || !visibilityData?.length
      ? DEFAULT_SECTIONS
      : visibilityData.map((section) => ({
          section_key: section.section_key,
          label: section.label,
          is_visible: Boolean(section.is_visible),
          sort_order: Number(section.sort_order || 0),
        }));

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <VisibilityManager initialSections={sections} />
    </AdminLayout>
  );
}
