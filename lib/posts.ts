import { createClient } from "@/lib/supabase/server";
import { Post } from "./post-utils";

export type { Post, PostStatus } from "./post-utils";
export { formatPostDate, slugify, normalizePostTags } from "./post-utils";

export const getPublishedPosts = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Unable to fetch posts:", error);
    return [] as Post[];
  }

  return (data ?? []) as Post[];
};

export const getPublishedPostBySlug = async (slug: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("Unable to fetch post:", error);
    return null;
  }

  return data as Post | null;
};
