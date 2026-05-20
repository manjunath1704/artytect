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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const thumbnailAlt = String(formData.get("thumbnailAlt") ?? "").trim();
    const thumbnail = formData.get("thumbnail");
    const hoverThumbnail = formData.get("hoverThumbnail");

    if (!title || !slug || !description || !thumbnailAlt) {
      return NextResponse.json(
        { error: "Title, slug, description, and thumbnail alt text are required." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();
    const timestamp = Date.now();

    // Prepare update data
    const updateData: {
      category_name: string;
      category_slug: string;
      category_description: string;
      category_thumbnail_alt: string;
      category_thumbnail?: string;
      category_hover_thumbnail?: string;
    } = {
      category_name: title,
      category_slug: slug,
      category_description: description,
      category_thumbnail_alt: thumbnailAlt,
    };

    // Upload new thumbnail if provided
    if (thumbnail instanceof File) {
      await ensureCategoryThumbnailsBucket();
      const extension = thumbnail.name.includes(".") ? thumbnail.name.split(".").pop() : "jpg";
      const filePath = `${slug}/default-${timestamp}.${extension}`;
      const buffer = Buffer.from(await thumbnail.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(CATEGORY_BUCKET)
        .upload(filePath, buffer, {
          contentType: thumbnail.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from(CATEGORY_BUCKET).getPublicUrl(filePath);
      updateData.category_thumbnail = data.publicUrl;
    }

    // Upload new hover thumbnail if provided
    if (hoverThumbnail instanceof File) {
      await ensureCategoryThumbnailsBucket();
      const extension = hoverThumbnail.name.includes(".") ? hoverThumbnail.name.split(".").pop() : "jpg";
      const filePath = `${slug}/hover-${timestamp}.${extension}`;
      const buffer = Buffer.from(await hoverThumbnail.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(CATEGORY_BUCKET)
        .upload(filePath, buffer, {
          contentType: hoverThumbnail.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from(CATEGORY_BUCKET).getPublicUrl(filePath);
      updateData.category_hover_thumbnail = data.publicUrl;
    }

    // Update in database
    const { data: updatedCategory, error: updateError } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(updateError.message);
    }

    return NextResponse.json(
      {
        category: {
          id: updatedCategory.id,
          title: updatedCategory.category_name,
          slug: updatedCategory.category_slug,
          description: updatedCategory.category_description,
          thumbnail_url: updatedCategory.category_thumbnail,
          hover_thumbnail_url: updatedCategory.category_hover_thumbnail,
          thumbnail_alt: updatedCategory.category_thumbnail_alt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update category." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getAdminClient();

    // Delete from database
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Database delete error:', deleteError);
      throw new Error(deleteError.message);
    }

    return NextResponse.json(
      { message: "Category deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete category." },
      { status: 500 },
    );
  }
}
