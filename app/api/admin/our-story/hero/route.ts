import { createClient } from "@/lib/supabase/server";
import { getAdminClient, OUR_STORY_BUCKET, ensureOurStoryImagesBucket } from "@/lib/supabase/admin";
import { deleteStorageFile } from "@/lib/supabase/storage-utils";
import { NextRequest, NextResponse } from "next/server";

async function uploadImage(file: File, prefix: string): Promise<string> {
  const supabase = getAdminClient();
  await ensureOurStoryImagesBucket();

  const timestamp = Date.now();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filePath = `${prefix}-${timestamp}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(OUR_STORY_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(OUR_STORY_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string | null;
    const title = formData.get("title") as string;
    const subtitle = formData.get("subtitle") as string;
    const hero_image_alt = formData.get("hero_image_alt") as string;
    const existing_hero_image_url = formData.get("existing_hero_image_url") as string;
    const hero_image = formData.get("hero_image") as File | null;

    let hero_image_url = existing_hero_image_url;

    // Upload new hero image if provided
    if (hero_image) {
      // Delete old hero image before uploading new one
      if (existing_hero_image_url) {
        await deleteStorageFile(existing_hero_image_url, OUR_STORY_BUCKET);
      }
      hero_image_url = await uploadImage(hero_image, "our-story-hero");
    }

    const payload = {
      title,
      subtitle,
      hero_image_url,
      hero_image_alt,
    };

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from("our_story_hero")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ hero: data });
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("our_story_hero")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ hero: data });
    }
  } catch (error) {
    console.error("Error saving hero section:", error);
    return NextResponse.json(
      { error: "Failed to save hero section" },
      { status: 500 }
    );
  }
}
