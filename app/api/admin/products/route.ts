import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  ensureProductImagesBucket,
  getAdminClient,
  PRODUCT_BUCKET,
} from "@/lib/supabase/admin";
import { slugifyProductName } from "@/lib/products";

const requireUser = async () => {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  );
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
};

const parseList = (value: FormDataEntryValue | null) =>
  String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const uploadImage = async (file: File, slug: string, prefix: string) => {
  const supabase = getAdminClient();
  const extension = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const filePath = `${slug}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { error } = await supabase.storage.from(PRODUCT_BUCKET).upload(
    filePath,
    Buffer.from(await file.arrayBuffer()),
    { contentType: file.type || "image/jpeg", upsert: false },
  );
  if (error) throw new Error(error.message);
  return supabase.storage.from(PRODUCT_BUCKET).getPublicUrl(filePath).data.publicUrl;
};

export async function POST(request: Request) {
  try {
    if (!(await requireUser())) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const slug = slugifyProductName(String(formData.get("slug") || name));
    const category = String(formData.get("category") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const shortDescription = String(formData.get("short_description") || description).trim();
    const price = Number(formData.get("price") ?? 0);
    const quantity = Number(formData.get("quantity") ?? 0);
    const thumbnail = formData.get("thumbnail");
    const gallery = formData.getAll("gallery").filter((file): file is File => file instanceof File);

    if (!name || !slug || !category || !description || !price) {
      return NextResponse.json({ error: "Name, slug, category, description, and price are required." }, { status: 400 });
    }
    if (!(thumbnail instanceof File)) {
      return NextResponse.json({ error: "Please upload a thumbnail image." }, { status: 400 });
    }

    await ensureProductImagesBucket();
    const thumbnailUrl = await uploadImage(thumbnail, slug, "thumbnail");
    const galleryUrls = await Promise.all(gallery.map((file, index) => uploadImage(file, slug, `gallery-${index}`)));
    const measurementTable = JSON.parse(String(formData.get("measurement_table") || "[]"));

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        category,
        description,
        short_description: shortDescription,
        price,
        quantity,
        sizes: ["S", "M", "L", "XL"],
        colors: parseList(formData.get("colors")),
        measurement_table: measurementTable,
        thumbnail_url: thumbnailUrl,
        gallery_urls: galleryUrls,
        status: formData.get("status") === "published" ? "published" : "draft",
        is_featured: formData.get("is_featured") === "true",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create product." },
      { status: 500 },
    );
  }
}
