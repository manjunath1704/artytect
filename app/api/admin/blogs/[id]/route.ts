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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params;
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
    const removeImage = String(formData.get("remove_image") ?? "") === "true";

    if (!title || !slug || !short_description || !content || !category || !author) {
      return NextResponse.json({ error: "Please fill in all required blog fields." }, { status: 400 });
    }

    let featured_image: string | null | undefined;
    if (image instanceof File && image.size > 0) {
      featured_image = await uploadFeaturedImage(image, slug);
    } else if (removeImage) {
      featured_image = null;
    }

    const payload: Record<string, unknown> = {
      title,
      slug,
      short_description,
      content,
      category,
      tags: parseTags(formData.get("tags")),
      author,
      meta_title: String(formData.get("meta_title") ?? "").trim() || null,
      meta_description: String(formData.get("meta_description") ?? "").trim() || null,
      status,
      published_at: status === "published" ? published_at ?? new Date().toISOString() : published_at,
    };

    if (featured_image !== undefined) payload.featured_image = featured_image;

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("blogs")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ blog: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update blog." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const status = body.status === "published" ? "published" : "draft";
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("blogs")
      .update({
        status,
        published_at: status === "published" ? body.published_at ?? new Date().toISOString() : body.published_at ?? null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ blog: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update publish status." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const { id } = await params;
    const supabase = getAdminClient();
    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete blog." },
      { status: 500 },
    );
  }
}
