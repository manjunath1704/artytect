import { redirect } from "next/navigation";

import { AdminLayout } from "@/app/admin/admin-layout";
import { createClient } from "@/lib/supabase/server";
import { Blog } from "@/lib/blog-utils";

import BlogsManager from "./blogs-manager";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: blogs, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load blogs:", error);
  }

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <BlogsManager
        initialUserEmail={data.user.email ?? ""}
        initialBlogs={(blogs ?? []) as Blog[]}
      />
    </AdminLayout>
  );
}
