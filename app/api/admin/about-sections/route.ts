import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  ABOUT_BUCKET,
  ensureAboutSectionImagesBucket,
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

export async function POST(request: Request) {
  try {
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

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Please upload an about section image." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();
    const timestamp = Date.now();
    await ensureAboutSectionImagesBucket();

    const { count, error: countError } = await supabase
      .from("about_sections")
      .select("*", { count: "exact", head: true });

    if (countError) throw new Error(countError.message);

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: "An about section already exists. Please edit the existing entry." },
        { status: 409 },
      );
    }

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

    const { data: publicUrlData } = supabase.storage
      .from(ABOUT_BUCKET)
      .getPublicUrl(filePath);

    const { data: insertedSection, error: insertError } = await supabase
      .from("about_sections")
      .insert({
        eyebrow,
        title,
        description_primary: descriptionPrimary,
        description_secondary: descriptionSecondary,
        image_url: publicUrlData.publicUrl,
        image_alt: imageAlt,
        button_label: buttonLabel,
        button_href: buttonHref,
      })
      .select()
      .single();

    if (insertError) throw new Error(insertError.message);

    return NextResponse.json({ aboutSection: insertedSection }, { status: 201 });
  } catch (error) {
    console.error("Error creating about section:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create about section." },
      { status: 500 },
    );
  }
}
