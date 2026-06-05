import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { CONTACT_BUCKET, ensureContactImagesBucket, getAdminClient } from "@/lib/supabase/admin";

async function uploadContactImage(file: File): Promise<string> {
  const supabase = getAdminClient();
  console.log("uploadContactImage called with file:", {
    name: file.name,
    size: file.size,
    type: file.type,
  });

  await ensureContactImagesBucket();
  console.log("Contact bucket ensured");

  const timestamp = Date.now();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filePath = `hero-${timestamp}.${extension}`;
  console.log("Uploading to:", filePath);

  const buffer = Buffer.from(await file.arrayBuffer());
  console.log("Buffer created, size:", buffer.length);

  const { error: uploadError } = await supabase.storage
    .from(CONTACT_BUCKET)
    .upload(filePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error(uploadError.message);
  }

  console.log("File uploaded successfully");

  const { data: publicUrlData } = supabase.storage
    .from(CONTACT_BUCKET)
    .getPublicUrl(filePath);

  console.log("Public URL data:", publicUrlData);
  console.log("Public URL:", publicUrlData.publicUrl);

  return publicUrlData.publicUrl;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const heroSubtitle = formData.get("hero_subtitle") as string;
    const heroTitle = formData.get("hero_title") as string;
    const heroDescription = formData.get("hero_description") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const mapEmbedUrl = formData.get("map_embed_url") as string;
    const heroImageFile = formData.get("hero_image") as File | null;

    console.log("Contact POST - Received data:", {
      heroSubtitle,
      heroTitle,
      email,
      phone,
      hasImageFile: !!heroImageFile,
      imageFileName: heroImageFile?.name,
      imageFileSize: heroImageFile?.size,
    });

    let heroImageUrl = "";

    if (heroImageFile && heroImageFile.size > 0) {
      console.log("Uploading image...");
      heroImageUrl = await uploadContactImage(heroImageFile);
      console.log("Image uploaded successfully:", heroImageUrl);
    }

    const { data, error } = await supabase
      .from("contact_page")
      .insert([
        {
          hero_subtitle: heroSubtitle,
          hero_title: heroTitle,
          hero_description: heroDescription,
          hero_image_url: heroImageUrl,
          email,
          phone,
          map_embed_url: mapEmbedUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("Error creating contact page:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
