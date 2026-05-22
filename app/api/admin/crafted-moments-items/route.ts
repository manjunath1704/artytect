import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  CRAFTED_MOMENTS_BUCKET,
  ensureCraftedMomentsMediaBucket,
  getAdminClient,
} from "@/lib/supabase/admin";

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
  if (error || !data.user) return null;
  return data.user;
};

const uploadFile = async (file: File, prefix: string) => {
  const supabase = getAdminClient();
  await ensureCraftedMomentsMediaBucket();

  const timestamp = Date.now();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filePath = `${prefix}-${timestamp}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(CRAFTED_MOMENTS_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(CRAFTED_MOMENTS_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
};

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const formData = await request.formData();
    const type = String(formData.get("type") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const caption = String(formData.get("caption") ?? "").trim();
    const label = String(formData.get("label") ?? "").trim();
    const sortOrder = Number(formData.get("sortOrder") ?? 0);
    const isFeatured = String(formData.get("isFeatured") ?? "false") === "true";
    const media = formData.get("media");
    const poster = formData.get("poster");

    if ((type !== "image" && type !== "video") || !title || !caption || !label || !Number.isFinite(sortOrder)) {
      return NextResponse.json(
        { error: "Type, title, caption, label, and sort order are required." },
        { status: 400 },
      );
    }

    if (!(media instanceof File)) {
      return NextResponse.json({ error: "Please upload media for this item." }, { status: 400 });
    }

    const supabase = getAdminClient();
    const mediaUrl = await uploadFile(media, `${type}-${sortOrder}`);
    const posterUrl = poster instanceof File ? await uploadFile(poster, `poster-${sortOrder}`) : null;

    if (isFeatured) {
      const { error } = await supabase
        .from("crafted_moments_items")
        .update({ is_featured: false })
        .eq("is_featured", true);
      if (error) throw new Error(error.message);
    }

    const { data: item, error } = await supabase
      .from("crafted_moments_items")
      .insert({
        type,
        title,
        caption,
        media_url: mediaUrl,
        poster_url: posterUrl,
        label,
        is_featured: isFeatured,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Error creating crafted moment item:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create crafted moment item." },
      { status: 500 },
    );
  }
}
