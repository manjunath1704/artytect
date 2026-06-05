import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLayout } from "@/app/admin/admin-layout";
import ContactPageManager from "./contact-manager";

export const dynamic = "force-dynamic";

export type ContactPageData = {
  id: string;
  hero_subtitle: string;
  hero_title: string;
  hero_description: string;
  hero_image_url: string;
  email: string;
  phone: string;
  map_embed_url: string;
  created_at: string;
  updated_at: string;
};

export default async function AdminContactPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    redirect("/admin/login");
  }

  // Fetch contact page data
  const { data: contactData } = await supabase
    .from("contact_page")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <AdminLayout userEmail={data.user.email || ""}>
      <ContactPageManager initialData={contactData as ContactPageData | null} />
    </AdminLayout>
  );
}
