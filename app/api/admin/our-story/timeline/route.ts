import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const OUR_STORY_BUCKET = "our-story-images";

async function ensureBucket() {
  const supabase = await createClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === OUR_STORY_BUCKET);
  
  if (!exists) {
    await supabase.storage.createBucket(OUR_STORY_BUCKET, { public: true });
  }
}

async function uploadImage(file: File, prefix: string): Promise<string> {
  const supabase = await createClient();
  await ensureBucket();

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
    const year = formData.get("year") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const existing_image_url = formData.get("existing_image_url") as string;
    const timeline_image = formData.get("timeline_image") as File | null;

    let image_url = existing_image_url;

    if (timeline_image) {
      image_url = await uploadImage(timeline_image, "our-story-timeline");
    }

    // Get max sort_order
    const { data: maxData } = await supabase
      .from("our_story_timeline")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sort_order = (maxData?.sort_order || 0) + 10;

    const { data, error } = await supabase
      .from("our_story_timeline")
      .insert({ year, title, description, image_url, sort_order })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ timeline: data });
  } catch (error) {
    console.error("Error creating timeline item:", error);
    return NextResponse.json(
      { error: "Failed to create timeline item" },
      { status: 500 }
    );
  }
}
