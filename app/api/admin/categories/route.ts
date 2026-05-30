import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  CATEGORY_BUCKET,
  ensureCategoryThumbnailsBucket,
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

  if (error || !data.user) {
    return null;
  }

  return data.user;
};

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const categoryType = String(formData.get("categoryType") ?? "parent").trim();
    const parentCategoryId = String(formData.get("parentCategoryId") ?? "").trim();
    const thumbnailAlt = String(formData.get("thumbnailAlt") ?? "").trim();
    const thumbnail = formData.get("thumbnail");
    const hoverThumbnail = formData.get("hoverThumbnail");

    if (!title || !slug || !description || !thumbnailAlt) {
      return NextResponse.json(
        { error: "Title, slug, description, and thumbnail alt text are required." },
        { status: 400 },
      );
    }

    if (!(thumbnail instanceof File) || !(hoverThumbnail instanceof File)) {
      return NextResponse.json(
        { error: "Please upload both thumbnail images." },
        { status: 400 },
      );
    }

    const timestamp = Date.now();
    const supabase = getAdminClient();

    if (categoryType !== "parent" && categoryType !== "child") {
      return NextResponse.json(
        { error: "Category type must be Parent Category or Child Category." },
        { status: 400 },
      );
    }

    if (categoryType === "child") {
      if (!parentCategoryId) {
        return NextResponse.json(
          { error: "Select a parent category for child categories." },
          { status: 400 },
        );
      }

      const { data: parentCategory, error: parentError } = await supabase
        .from("categories")
        .select("id, parent_category_id")
        .eq("id", parentCategoryId)
        .maybeSingle();

      if (parentError || !parentCategory) {
        return NextResponse.json(
          { error: "Selected parent category does not exist." },
          { status: 400 },
        );
      }

      if (parentCategory.parent_category_id) {
        return NextResponse.json(
          { error: "Child categories cannot be used as parent categories." },
          { status: 400 },
        );
      }
    }

    await ensureCategoryThumbnailsBucket();

    const uploadThumbnail = async (file: File, variant: "default" | "hover") => {
      const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
      const filePath = `${slug}/${variant}-${timestamp}.${extension}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(CATEGORY_BUCKET)
        .upload(filePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from(CATEGORY_BUCKET).getPublicUrl(filePath);
      return data.publicUrl;
    };

    const thumbnail_url = await uploadThumbnail(thumbnail, "default");
    const hover_thumbnail_url = await uploadThumbnail(hoverThumbnail, "hover");

    // Insert into Supabase database directly
    const { data: insertedCategory, error: insertError } = await supabase
      .from('categories')
      .insert({
        category_name: title,
        category_slug: slug,
        category_description: description,
        category_thumbnail: thumbnail_url,
        category_hover_thumbnail: hover_thumbnail_url,
        category_thumbnail_alt: thumbnailAlt,
        parent_category_id: categoryType === "child" ? parentCategoryId : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(insertError.message);
    }

    return NextResponse.json(
      {
        category: {
          id: insertedCategory.id,
          title: insertedCategory.category_name,
          slug: insertedCategory.category_slug,
          description: insertedCategory.category_description,
          thumbnail_url: insertedCategory.category_thumbnail,
          hover_thumbnail_url: insertedCategory.category_hover_thumbnail,
          parent_category_id: insertedCategory.parent_category_id,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create category." },
      { status: 500 },
    );
  }
}
