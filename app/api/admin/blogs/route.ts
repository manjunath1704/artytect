import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { BLOG_BUCKET, ensureBlogFeaturedImagesBucket, getAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/blog-utils";

const getAuthenticatedUser = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getUser();
  return error || !data.user ? null : data.user;
};

const parseTags = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const uploadFeaturedImage = async (file: File, slug: string) => {
  await ensureBlogFeaturedImagesBucket();
  const supabase = getAdminClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filePath = `${slug}/${Date.now()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(BLOG_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("blogs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ blogs: data ?? [] });
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const slug = slugify(String(formData.get("slug") ?? title));
    const short_description = String(formData.get("short_description") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const status = String(formData.get("status") ?? "draft") === "published" ? "published" : "draft";
    const published_at = String(formData.get("published_at") ?? "").trim() || null;
    const image = formData.get("featured_image");

    if (!title || !slug || !short_description || !content || !category || !author) {
      return NextResponse.json({ error: "Please fill in all required blog fields." }, { status: 400 });
    }

    const featured_image = image instanceof File && image.size > 0
      ? await uploadFeaturedImage(image, slug)
      : null;

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("blogs")
      .insert({
        title,
        slug,
        featured_image,
        short_description,
        content,
        category,
        tags: parseTags(formData.get("tags")),
        author,
        meta_title: String(formData.get("meta_title") ?? "").trim() || null,
        meta_description: String(formData.get("meta_description") ?? "").trim() || null,
        status,
        published_at: status === "published" ? published_at ?? new Date().toISOString() : published_at,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ blog: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create blog." },
      { status: 500 },
    );
  }
}
