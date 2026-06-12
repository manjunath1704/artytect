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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const year = formData.get("year") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const existing_image_url = formData.get("existing_image_url") as string;
    const timeline_image = formData.get("timeline_image") as File | null;

    let image_url = existing_image_url;

    if (timeline_image) {
      // Delete old image before uploading new one
      if (existing_image_url) {
        await deleteStorageFile(existing_image_url, OUR_STORY_BUCKET);
      }
      image_url = await uploadImage(timeline_image, "our-story-timeline");
    }

    const { data, error } = await supabase
      .from("our_story_timeline")
      .update({ year, title, description, image_url })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ timeline: data });
  } catch (error) {
    console.error("Error updating timeline item:", error);
    return NextResponse.json(
      { error: "Failed to update timeline item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch timeline item to get image URL for storage cleanup
    const { data: item } = await supabase
      .from("our_story_timeline")
      .select("image_url")
      .eq("id", id)
      .single();

    // Delete image from storage
    if (item?.image_url) {
      await deleteStorageFile(item.image_url, OUR_STORY_BUCKET);
    }

    const { error } = await supabase
      .from("our_story_timeline")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting timeline item:", error);
    return NextResponse.json(
      { error: "Failed to delete timeline item" },
      { status: 500 }
    );
  }
}
