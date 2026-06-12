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
    
    const who_we_are_title = formData.get("who_we_are_title") as string;
    const who_we_are_content = formData.get("who_we_are_content") as string;
    const who_we_are_image_url = formData.get("who_we_are_image_url") as string;
    const who_we_are_image = formData.get("who_we_are_image") as File | null;
    
    const journey_title = formData.get("journey_title") as string;
    const journey_content = formData.get("journey_content") as string;
    const journey_image_url = formData.get("journey_image_url") as string;
    const journey_image = formData.get("journey_image") as File | null;
    
    const mission_title = formData.get("mission_title") as string;
    const mission_content = formData.get("mission_content") as string;
    const vision_title = formData.get("vision_title") as string;
    const vision_content = formData.get("vision_content") as string;

    let final_who_we_are_image = who_we_are_image_url;
    let final_journey_image = journey_image_url;

    // Upload images if provided, deleting old ones first
    if (who_we_are_image) {
      if (who_we_are_image_url) {
        await deleteStorageFile(who_we_are_image_url, OUR_STORY_BUCKET);
      }
      final_who_we_are_image = await uploadImage(who_we_are_image, "our-story");
    }
    if (journey_image) {
      if (journey_image_url) {
        await deleteStorageFile(journey_image_url, OUR_STORY_BUCKET);
      }
      final_journey_image = await uploadImage(journey_image, "our-story");
    }

    const payload = {
      who_we_are_title,
      who_we_are_content,
      who_we_are_image_url: final_who_we_are_image,
      journey_title,
      journey_content,
      journey_image_url: final_journey_image,
      mission_title,
      mission_content,
      vision_title,
      vision_content,
    };

    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from("our_story_content")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ content: data });
    } else {
      // Insert new
      const { data, error } = await supabase
        .from("our_story_content")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ content: data });
    }
  } catch (error) {
    console.error("Error saving content:", error);
    return NextResponse.json(
      { error: "Failed to save content" },
      { status: 500 }
    );
  }
}
