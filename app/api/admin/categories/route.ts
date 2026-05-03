import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  CATEGORY_BUCKET,
  ensureCategoryThumbnailsBucket,
  getAdminClient,
} from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thumbnail = formData.get("thumbnail");
  const hoverThumbnail = formData.get("hoverThumbnail");

  if (!title || !description) {
    return NextResponse.json(
      { error: "Title and description are required." },
      { status: 400 },
    );
  }

  if (!(thumbnail instanceof File) || !(hoverThumbnail instanceof File)) {
    return NextResponse.json(
      { error: "Please upload both thumbnail images." },
      { status: 400 },
    );
  }

  const categorySlug = slugify(title);
  const timestamp = Date.now();
  const supabase = getAdminClient();

  await ensureCategoryThumbnailsBucket();

  const uploadThumbnail = async (file: File, variant: "default" | "hover") => {
    const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
    const filePath = `${categorySlug}/${variant}-${timestamp}.${extension}`;
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

  const insertedCategory = await prisma.category.create({
    data: {
      title,
      slug: categorySlug,
      description,
      thumbnailUrl: thumbnail_url,
      hoverThumbnailUrl: hover_thumbnail_url,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      thumbnailUrl: true,
      hoverThumbnailUrl: true,
    },
  });

  return NextResponse.json(
    {
      category: {
        id: insertedCategory.id,
        title: insertedCategory.title,
        slug: insertedCategory.slug,
        description: insertedCategory.description,
        thumbnail_url: insertedCategory.thumbnailUrl,
        hover_thumbnail_url: insertedCategory.hoverThumbnailUrl,
      },
    },
    { status: 201 },
  );
}
