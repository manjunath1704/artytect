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

type VariantInput = {
  id?: string;
  colorName: string;
  colorCode: string;
  sizes: { id?: string; size: string; price: string; compareAtPrice: string; stockQuantity: string }[];
};

export async function PUT(request: Request, { params }: ProductRouteProps) {
  try {
    const { id } = await params;
    const supabase = getAdminClient();
    
    // Get existing product data first
    const { data: existingProduct } = await supabase
      .from("products")
      .select("thumbnail_url, gallery_urls, slug")
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
    
    /**
     * Parse a PostgreSQL text[] value that may come as:
     *  - a JS array   → use as-is
     *  - a JSON string → parse
     *  - a PG literal  → "{val1,val2}" → split and clean
     */
    const parsePgTextArray = (value: unknown): string[] => {
      if (Array.isArray(value)) return value;
      if (typeof value !== "string" || !value) return [];
      const trimmed = value.trim();
      // PG literal: {val1,"val2"}
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        return trimmed
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^"|"$/g, ""))
          .filter(Boolean);
      }
      // JSON string array
      try { return JSON.parse(trimmed); } catch { return []; }
    };

    // Delete removed gallery images
    if (existingProduct?.gallery_urls) {
      const oldGalleryUrls = parsePgTextArray(existingProduct.gallery_urls);
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

    // Handle variants
    const variantsJson = String(formData.get("variants") || "[]");
    let variants: VariantInput[] = [];
    try {
      variants = JSON.parse(variantsJson);
    } catch { /* ignore parse errors */ }

    // Get existing variant IDs to determine what to delete/update
    const { data: existingVariants } = await supabase
      .from("product_variants")
      .select("id")
      .eq("product_id", id);

    const existingVariantIds = existingVariants?.map((v) => v.id) ?? [];
    const incomingVariantIds = variants.filter((v) => v.id).map((v) => v.id!);
    const variantsToDelete = existingVariantIds.filter((eid) => !incomingVariantIds.includes(eid));

    // Delete removed variants (cascade will delete sizes)
    if (variantsToDelete.length) {
      // Delete variant images from storage
      const { data: toDeleteVariants } = await supabase
        .from("product_variants")
        .select("images")
        .in("id", variantsToDelete);

      if (toDeleteVariants?.length) {
        for (const dv of toDeleteVariants) {
          const imgs = Array.isArray(dv.images) ? dv.images : [];
          if (imgs.length) {
            await deleteStorageFiles(imgs, STORAGE_BUCKETS.PRODUCTS);
          }
        }
      }

      await supabase.from("variant_sizes").delete().in("variant_id", variantsToDelete);
      await supabase.from("product_variants").delete().in("id", variantsToDelete);
    }

    // Upsert variants
    for (let vi = 0; vi < variants.length; vi++) {
      const v = variants[vi];

      // Upload new variant images
      const variantImageFiles = formData.getAll(`variant_images_${vi}`).filter((f): f is File => f instanceof File);
      const existingVariantImages = JSON.parse(String(formData.get(`existing_variant_images_${vi}`) || "[]")) as string[];
      const newVariantImageUrls = await Promise.all(
        variantImageFiles.map((file, idx) => uploadImage(file, slug, `variant-${vi}-${idx}`)),
      );
      const allVariantImages = [...existingVariantImages, ...newVariantImageUrls];

      // Delete removed variant images from storage
      if (v.id) {
        const { data: oldVariant } = await supabase
          .from("product_variants")
          .select("images")
          .eq("id", v.id)
          .maybeSingle();

        if (oldVariant?.images) {
          const oldImgs = Array.isArray(oldVariant.images) ? oldVariant.images : [];
          const removedImgs = oldImgs.filter((img: string) => !allVariantImages.includes(img));
          if (removedImgs.length) {
            await deleteStorageFiles(removedImgs, STORAGE_BUCKETS.PRODUCTS);
          }
        }
      }

      if (v.id) {
        // Update existing variant
        await supabase
          .from("product_variants")
          .update({
            color_name: v.colorName,
            color_code: v.colorCode,
            sort_order: vi,
            images: allVariantImages,
          })
          .eq("id", v.id);

        // Sync sizes: delete existing and re-insert
        await supabase.from("variant_sizes").delete().eq("variant_id", v.id);

        const sizeInserts = v.sizes
          .filter((s) => s.size && s.price)
          .map((s) => ({
            variant_id: v.id!,
            size: s.size,
            price: Number(s.price) || 0,
            compare_at_price: s.compareAtPrice ? Number(s.compareAtPrice) : null,
            stock_quantity: Number(s.stockQuantity) || 0,
          }));

        if (sizeInserts.length) {
          await supabase.from("variant_sizes").insert(sizeInserts);
        }
      } else {
        // Insert new variant
        const { data: variantRow, error: vErr } = await supabase
          .from("product_variants")
          .insert({
            product_id: id,
            color_name: v.colorName,
            color_code: v.colorCode,
            sort_order: vi,
            images: allVariantImages,
          })
          .select()
          .single();

        if (vErr || !variantRow) continue;

        const sizeInserts = v.sizes
          .filter((s) => s.size && s.price)
          .map((s) => ({
            variant_id: variantRow.id,
            size: s.size,
            price: Number(s.price) || 0,
            compare_at_price: s.compareAtPrice ? Number(s.compareAtPrice) : null,
            stock_quantity: Number(s.stockQuantity) || 0,
          }));

        if (sizeInserts.length) {
          await supabase.from("variant_sizes").insert(sizeInserts);
        }
      }
    }

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
    
    // Delete variant data and images
    const { data: variants } = await supabase
      .from("product_variants")
      .select("id, images")
      .eq("product_id", id);

    if (variants?.length) {
      for (const v of variants) {
        const imgs = Array.isArray(v.images) ? v.images : [];
        if (imgs.length) {
          await deleteStorageFiles(imgs, STORAGE_BUCKETS.PRODUCTS);
        }
      }
    }

    // Delete the product from database (cascades to variants and sizes)
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