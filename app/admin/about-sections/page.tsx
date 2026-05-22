import { redirect } from "next/navigation";

import AboutSectionsManager from "./about-sections-manager";
import { AdminLayout } from "../admin-layout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AboutSectionRow = {
  id: string;
  eyebrow: string;
  title: string;
  description_primary: string;
  description_secondary: string;
  image_url: string;
  image_alt: string;
  button_label: string;
  button_href: string;
};

export default async function AboutSectionsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: aboutSectionsData, error } = await supabase
    .from("about_sections")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);

  const aboutSections: AboutSectionRow[] = error
    ? []
    : (aboutSectionsData || []).map((section) => ({
        id: String(section.id),
        eyebrow: section.eyebrow || "",
        title: section.title || "",
        description_primary: section.description_primary || "",
        description_secondary: section.description_secondary || "",
        image_url: section.image_url || "",
        image_alt: section.image_alt || "",
        button_label: section.button_label || "",
        button_href: section.button_href || "",
      }));

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <AboutSectionsManager
        initialUserEmail={data.user.email ?? ""}
        initialAboutSections={aboutSections}
      />
    </AdminLayout>
  );
}
