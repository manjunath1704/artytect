import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

import { ensureProductImagesBucket, getAdminClient, PRODUCT_BUCKET } from "@/lib/supabase/admin";
import { slugifyProductName } from "@/lib/products";
import { deleteStorageFile, deleteStorageFiles, deleteStorageFolder, STORAGE_BUCKETS } from "@/lib/supabase/storage-utils";

type ProductRouteProps = {
  params: Promise<{ id: string }>;
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

export async function PUT(request: Request, { params }: ProductRouteProps) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    
    // Get existing product data first
    const { data: existingProduct } = await supabase
      .from("products")
      .select("thumbnail_url, gallery_urls")
      .eq("id", id)
      .single();

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const slug = slugifyProductName(String(formData.get("slug") || name));
    const existingGallery = JSON.parse(String(formData.get("existing_gallery") || "[]")) as string[];
    const thumbnail = formData.get("thumbnail");
    const gallery = formData.getAll("gallery").filter((file): file is File => file instanceof File);

    await ensureProductImagesBucket();
    
    // Handle thumbnail replacement
    let thumbnailUrl = String(formData.get("thumbnail_url") ?? "");
    if (thumbnail instanceof File) {
      // Delete old thumbnail if exists (we're uploading a new one)
      if (existingProduct?.thumbnail_url) {
        await deleteStorageFile(existingProduct.thumbnail_url, STORAGE_BUCKETS.PRODUCTS);
      }
      thumbnailUrl = await uploadImage(thumbnail, slug, "thumbnail");
    }
    
    // Handle gallery images
    const newGalleryUrls = await Promise.all(gallery.map((file, index) => uploadImage(file, slug, `gallery-${index}`)));
    
    // Delete removed gallery images
    if (existingProduct?.gallery_urls) {
      const oldGalleryUrls = Array.isArray(existingProduct.gallery_urls) 
        ? existingProduct.gallery_urls 
        : [];
      const removedUrls = oldGalleryUrls.filter((url: string) => !existingGallery.includes(url));
      
      const logPath = path.join(process.cwd(), 'gallery-delete-log.txt');
      fs.appendFileSync(logPath, `\n=== ${new Date().toISOString()} ===\n`);
      fs.appendFileSync(logPath, `Old gallery: ${JSON.stringify(oldGalleryUrls)}\n`);
      fs.appendFileSync(logPath, `Keep gallery: ${JSON.stringify(existingGallery)}\n`);
      fs.appendFileSync(logPath, `Removed URLs: ${JSON.stringify(removedUrls)}\n`);
      
      if (removedUrls.length > 0) {
        const deletedCount = await deleteStorageFiles(removedUrls, STORAGE_BUCKETS.PRODUCTS);
        fs.appendFileSync(logPath, `Deleted count: ${deletedCount}\n`);
      }
    }

    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        slug,
        category: String(formData.get("category") ?? "").trim(),
        description: String(formData.get("description") ?? "").trim(),
        short_description: String(formData.get("short_description") ?? "").trim(),
        price: Number(formData.get("price") ?? 0),
        quantity: Number(formData.get("quantity") ?? 0),
        sizes: ["S", "M", "L", "XL"],
        colors: parseList(formData.get("colors")),
        measurement_table: JSON.parse(String(formData.get("measurement_table") || "[]")),
        thumbnail_url: thumbnailUrl,
        gallery_urls: [...existingGallery, ...newGalleryUrls],
        status: formData.get("status") === "published" ? "published" : "draft",
        is_featured: formData.get("is_featured") === "true",
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ product: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update product." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: ProductRouteProps) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    
    // Get product data to extract slug for folder deletion
    const { data: product } = await supabase
      .from("products")
      .select("slug, thumbnail_url")
      .eq("id", id)
      .single();
    
    // Delete the product from database
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    
    // Delete entire product folder from storage
    if (product?.slug) {
      await deleteStorageFolder(product.slug, STORAGE_BUCKETS.PRODUCTS);
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete product." },
      { status: 500 },
    );
  }
}
