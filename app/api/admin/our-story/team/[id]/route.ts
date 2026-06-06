import { createClient } from "@/lib/supabase/server";
import { getAdminClient, OUR_STORY_BUCKET, ensureOurStoryImagesBucket } from "@/lib/supabase/admin";
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
    const name = formData.get("name") as string;
    const role = formData.get("role") as string;
    const bio = formData.get("bio") as string;
    const is_visible = formData.get("is_visible") === "true";
    const existing_image_url = formData.get("existing_image_url") as string;
    const member_image = formData.get("member_image") as File | null;

    let image_url = existing_image_url;

    if (member_image) {
      image_url = await uploadImage(member_image, "our-story-team");
    }

    const { data, error } = await supabase
      .from("our_story_team")
      .update({ name, role, bio, image_url, is_visible })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ member: data });
  } catch (error) {
    console.error("Error updating team member:", error);
    return NextResponse.json(
      { error: "Failed to update team member" },
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

    const { error } = await supabase
      .from("our_story_team")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team member:", error);
    return NextResponse.json(
      { error: "Failed to delete team member" },
      { status: 500 }
    );
  }
}
