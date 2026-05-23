import { createClient } from "@/lib/supabase/server";
import { Blog } from "@/lib/blog-utils";

export type { Blog, BlogStatus } from "@/lib/blog-utils";
export { formatBlogDate, slugify } from "@/lib/blog-utils";

export const getPublishedBlogs = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Unable to fetch blogs:", error);
    return [] as Blog[];
  }

  return (data ?? []) as Blog[];
};

export const getPublishedBlogBySlug = async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Unable to fetch blog:", error);
    return null;
  }

  return data as Blog | null;
};
