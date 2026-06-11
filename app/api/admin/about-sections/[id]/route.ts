import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  ABOUT_BUCKET,
  ensureAboutSectionImagesBucket,
  getAdminClient,
} from "@/lib/supabase/admin";
import { deleteStorageFile, STORAGE_BUCKETS } from "@/lib/supabase/storage-utils";

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const eyebrow = String(formData.get("eyebrow") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const descriptionPrimary = String(formData.get("descriptionPrimary") ?? "").trim();
    const descriptionSecondary = String(formData.get("descriptionSecondary") ?? "").trim();
    const imageAlt = String(formData.get("imageAlt") ?? "").trim();
    const buttonLabel = String(formData.get("buttonLabel") ?? "").trim();
    const buttonHref = String(formData.get("buttonHref") ?? "").trim();
    const image = formData.get("image");

    if (!eyebrow || !title || !descriptionPrimary || !descriptionSecondary || !imageAlt || !buttonLabel || !buttonHref) {
      return NextResponse.json(
        { error: "All about section fields are required." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();

    // Fetch existing image_url before update
    const { data: existingSection } = await supabase
      .from("about_sections")
      .select("image_url")
      .eq("id", id)
      .single();

    const updateData: {
      eyebrow: string;
      title: string;
      description_primary: string;
      description_secondary: string;
      image_alt: string;
      button_label: string;
      button_href: string;
      image_url?: string;
    } = {
      eyebrow,
      title,
      description_primary: descriptionPrimary,
      description_secondary: descriptionSecondary,
      image_alt: imageAlt,
      button_label: buttonLabel,
      button_href: buttonHref,
    };

    if (image instanceof File) {
      // Delete old image from storage if exists
      if (existingSection?.image_url) {
        await deleteStorageFile(existingSection.image_url, STORAGE_BUCKETS.ABOUT);
      }
      const timestamp = Date.now();
      await ensureAboutSectionImagesBucket();
      const extension = image.name.includes(".") ? image.name.split(".").pop() : "jpg";
      const filePath = `about-${timestamp}.${extension}`;
      const buffer = Buffer.from(await image.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(ABOUT_BUCKET)
        .upload(filePath, buffer, {
          contentType: image.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from(ABOUT_BUCKET).getPublicUrl(filePath);
      updateData.image_url = data.publicUrl;
    }

    const { data: updatedSection, error: updateError } = await supabase
      .from("about_sections")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);

    return NextResponse.json({ aboutSection: updatedSection }, { status: 200 });
  } catch (error) {
    console.error("Error updating about section:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update about section." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await params;
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json(
      { error: "The about section is a singleton and cannot be deleted. Please edit it instead." },
      { status: 405 },
    );
  } catch (error) {
    console.error("Error handling about section delete:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to handle about section delete." },
      { status: 500 },
    );
  }
}
