import { redirect } from "next/navigation";

import { AdminLayout } from "@/app/admin/admin-layout";
import { createClient } from "@/lib/supabase/server";
import { Post } from "@/lib/posts";

import PostsManager from "./posts-manager";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      `Unable to load posts error details: message="${error.message}", code="${error.code}", details="${error.details}", hint="${error.hint}"`
    );
  }

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <PostsManager
        initialUserEmail={data.user.email ?? ""}
        initialPosts={(posts ?? []) as Post[]}
      />
    </AdminLayout>
  );
}
