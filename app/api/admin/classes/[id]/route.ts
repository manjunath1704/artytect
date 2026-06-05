import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const CLASSES_BUCKET = "classes-images";

async function ensureBucket() {
  const supabase = await createClient();
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((bucket) => bucket.name === CLASSES_BUCKET);
  
  if (!exists) {
    await supabase.storage.createBucket(CLASSES_BUCKET, { public: true });
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
    .from(CLASSES_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(CLASSES_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const short_description = formData.get("short_description") as string;
    const content = formData.get("content") as string;
    const instructor_name = formData.get("instructor_name") as string;
    const duration = formData.get("duration") as string;
    const class_date = formData.get("class_date") as string;
    const class_time = formData.get("class_time") as string;
    const price = parseInt(formData.get("price") as string) || 0;
    const total_seats = parseInt(formData.get("total_seats") as string) || 0;
    const available_seats = parseInt(formData.get("available_seats") as string) || 0;
    const level = formData.get("level") as string;
    const is_featured = formData.get("is_featured") === "true";
    const is_published = formData.get("is_published") === "true";
    const existing_thumbnail_url = formData.get("existing_thumbnail_url") as string;
    const thumbnail = formData.get("thumbnail") as File | null;

    let thumbnail_url = existing_thumbnail_url;

    // Upload new thumbnail if provided
    if (thumbnail && thumbnail.size > 0) {
      thumbnail_url = await uploadImage(thumbnail, `class-${slug}`);
    }

    // Handle gallery images
    const galleryImages: string[] = [];
    const existingGalleryStr = formData.get("existing_gallery_images") as string;
    if (existingGalleryStr) {
      try {
        const existing = JSON.parse(existingGalleryStr);
        if (Array.isArray(existing)) {
          galleryImages.push(...existing);
        }
      } catch (e) {
        console.error("Failed to parse existing gallery images:", e);
      }
    }

    // Upload new gallery images
    const galleryFiles = formData.getAll("gallery_images") as File[];
    for (const file of galleryFiles) {
      if (file && file.size > 0) {
        const url = await uploadImage(file, `class-${slug}-gallery`);
        galleryImages.push(url);
      }
    }

    const payload = {
      slug,
      title,
      short_description,
      content,
      instructor_name,
      duration,
      class_date,
      class_time,
      price,
      total_seats,
      available_seats,
      level,
      thumbnail_url,
      gallery_images: galleryImages,
      is_featured,
      is_published,
    };

    const { data, error } = await supabase
      .from("classes")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    return NextResponse.json({ class: data });
  } catch (error) {
    console.error("Error updating class:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to update class";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("classes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
