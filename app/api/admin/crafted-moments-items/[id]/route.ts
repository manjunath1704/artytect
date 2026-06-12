import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  CRAFTED_MOMENTS_BUCKET,
  ensureCraftedMomentsMediaBucket,
  getAdminClient,
} from "@/lib/supabase/admin";
import { deleteStorageFile } from "@/lib/supabase/storage-utils";

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    const supabase = getAdminClient();

    // Fetch existing item to get old file URLs for cleanup
    const { data: existingItem } = await supabase
      .from("crafted_moments_items")
      .select("media_url, poster_url")
      .eq("id", id)
      .single();

    const updateData: {
      type: string;
      title: string;
      caption: string;
      label: string;
      is_featured: boolean;
      sort_order: number;
      media_url?: string;
      poster_url?: string | null;
    } = {
      type,
      title,
      caption,
      label,
      is_featured: isFeatured,
      sort_order: sortOrder,
    };

    if (media instanceof File) {
      // Delete old media file before uploading new one
      if (existingItem?.media_url) {
        await deleteStorageFile(existingItem.media_url, CRAFTED_MOMENTS_BUCKET);
      }
      updateData.media_url = await uploadFile(media, `${type}-${sortOrder}`);
    }

    if (poster instanceof File) {
      // Delete old poster file before uploading new one
      if (existingItem?.poster_url) {
        await deleteStorageFile(existingItem.poster_url, CRAFTED_MOMENTS_BUCKET);
      }
      updateData.poster_url = await uploadFile(poster, `poster-${sortOrder}`);
    } else if (type === "image") {
      // Delete old poster file if type changed to image
      if (existingItem?.poster_url) {
        await deleteStorageFile(existingItem.poster_url, CRAFTED_MOMENTS_BUCKET);
      }
      updateData.poster_url = null;
    }

    if (isFeatured) {
      const { error } = await supabase
        .from("crafted_moments_items")
        .update({ is_featured: false })
        .eq("is_featured", true)
        .neq("id", id);
      if (error) throw new Error(error.message);
    }

    const { data: item, error } = await supabase
      .from("crafted_moments_items")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error("Error updating crafted moment item:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update crafted moment item." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const supabase = getAdminClient();

    // Fetch item to get file URLs for storage cleanup
    const { data: item } = await supabase
      .from("crafted_moments_items")
      .select("media_url, poster_url")
      .eq("id", id)
      .single();

    // Delete files from storage
    if (item?.media_url) {
      await deleteStorageFile(item.media_url, CRAFTED_MOMENTS_BUCKET);
    }
    if (item?.poster_url) {
      await deleteStorageFile(item.poster_url, CRAFTED_MOMENTS_BUCKET);
    }

    const { error } = await supabase.from("crafted_moments_items").delete().eq("id", id);
    if (error) throw new Error(error.message);

    return NextResponse.json({ message: "Crafted moment item deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting crafted moment item:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete crafted moment item." },
      { status: 500 },
    );
  }
}
