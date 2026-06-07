# Storage Cleanup Implementation Guide

This document tracks the implementation of automatic storage cleanup for all image uploads across the admin panel.

## ✅ Completed

### Core Utility
- **`lib/supabase/storage-utils.ts`** - Global storage cleanup utilities created with:
  - `extractStoragePathFromUrl()` - Extract file path from Supabase URL
  - `deleteStorageFile()` - Delete single file
  - `deleteStorageFiles()` - Delete multiple files
  - `replaceStorageFile()` - Replace old file with new one
  - `STORAGE_BUCKETS` - Centralized bucket name constants

### API Routes Updated
1. **✅ Products** - `/app/api/admin/products/[id]/route.ts`
   - DELETE: Deletes thumbnail and all gallery images
   - PUT: Deletes old thumbnail when replaced, removes deleted gallery images

2. **✅ Classes** - `/app/api/admin/classes/[id]/route.ts`
   - DELETE: Deletes thumbnail and all gallery images
   - PUT: Deletes old thumbnail when replaced, removes deleted gallery images

## 🔄 Pending Implementation

The following API routes need to be updated to implement storage cleanup:

### High Priority (Images with CRUD operations)

3. **Blogs** - `/app/api/admin/blogs/[id]/route.ts`
   - Bucket: `blog-images`
   - Fields: `thumbnail_url`, `content` (may contain inline images)
   - Actions needed:
     - DELETE: Remove thumbnail
     - PUT: Replace old thumbnail if new one uploaded

4. **Categories** - `/app/api/admin/categories/[id]/route.ts`
   - Bucket: `category-images`
   - Fields: `thumbnail_url`, `hover_thumbnail_url`
   - Actions needed:
     - DELETE: Remove both thumbnails
     - PUT: Replace old thumbnails if new ones uploaded

5. **Hero Section** - `/app/api/admin/hero-section/route.ts`
   - Bucket: `hero-images`
   - Fields: `background_image_url`, `overlay_image_url`
   - Actions needed:
     - PUT: Replace old images if new ones uploaded

6. **Crafted Moments** - `/app/api/admin/crafted-moments-items/[id]/route.ts`
   - Bucket: `crafted-moments`
   - Fields: `media_url`, `poster_url` (for videos)
   - Actions needed:
     - DELETE: Remove media and poster
     - PUT: Replace old media/poster if new ones uploaded

7. **Our Story - Team** - `/app/api/admin/our-story/team/[id]/route.ts`
   - Bucket: `our-story-images`
   - Fields: `image_url`
   - Actions needed:
     - DELETE: Remove team member image
     - PUT: Replace old image if new one uploaded

8. **Our Story - Timeline** - `/app/api/admin/our-story/timeline/[id]/route.ts`
   - Bucket: `our-story-images`
   - Fields: `image_url`
   - Actions needed:
     - DELETE: Remove timeline image
     - PUT: Replace old image if new one uploaded

9. **Our Story - Hero** - `/app/api/admin/our-story/hero/route.ts`
   - Bucket: `our-story-images`
   - Fields: `background_image_url`
   - Actions needed:
     - PUT: Replace old background image if new one uploaded

10. **Our Story - Content** - `/app/api/admin/our-story/content/route.ts`
    - Bucket: `our-story-images`
    - Fields: `images` (array of image URLs)
    - Actions needed:
      - PUT: Remove deleted images from array

11. **About Sections** - `/app/api/admin/about-sections/[id]/route.ts`
    - Bucket: `about-images`
    - Fields: `image_url`
    - Actions needed:
      - DELETE: Remove section image
      - PUT: Replace old image if new one uploaded

12. **Testimonials** - `/app/api/admin/testimonials/[id]/route.ts`
    - Bucket: `testimonial-images`
    - Fields: `image_url`
    - Actions needed:
      - DELETE: Remove testimonial image
      - PUT: Replace old image if new one uploaded

### Medium Priority (Less frequent updates)

13. **Contact Images** - `/app/api/admin/contact/[id]/route.ts`
    - May contain images that need cleanup

14. **Process Section** - Check if it has image uploads

## Implementation Pattern

For each API route, follow this pattern:

### For DELETE operations:
```typescript
import { deleteStorageFile, deleteStorageFiles, STORAGE_BUCKETS } from "@/lib/supabase/storage-utils";

export async function DELETE(request: Request, { params }: RouteParams) {
  // 1. Get existing data first
  const { data: existing } = await supabase
    .from("table_name")
    .select("image_field")
    .eq("id", id)
    .single();
  
  // 2. Delete from database
  const { error } = await supabase.from("table_name").delete().eq("id", id);
  if (error) throw error;
  
  // 3. Delete images from storage
  if (existing?.image_field) {
    await deleteStorageFile(existing.image_field, STORAGE_BUCKETS.YOUR_BUCKET);
  }
  
  return NextResponse.json({ ok: true });
}
```

### For PUT/UPDATE operations:
```typescript
export async function PUT(request: Request, { params }: RouteParams) {
  // 1. Get existing data first
  const { data: existing } = await supabase
    .from("table_name")
    .select("image_field")
    .eq("id", id)
    .single();
  
  // 2. Handle new image upload
  let imageUrl = existing_image_url;
  if (newImageFile) {
    // Delete old image if exists and is different
    if (existing?.image_field && existing.image_field !== existing_image_url) {
      await deleteStorageFile(existing.image_field, STORAGE_BUCKETS.YOUR_BUCKET);
    }
    imageUrl = await uploadImage(newImageFile);
  }
  
  // 3. Update database
  const { data, error } = await supabase
    .from("table_name")
    .update({ image_field: imageUrl })
    .eq("id", id);
    
  return NextResponse.json({ data });
}
```

## Testing Checklist

After implementing storage cleanup for each module:

- [ ] Test DELETE: Verify image is removed from storage bucket
- [ ] Test UPDATE with new image: Verify old image is deleted, new image is uploaded
- [ ] Test UPDATE without new image: Verify existing image remains
- [ ] Check Supabase storage dashboard to confirm files are deleted
- [ ] Test with multiple images (gallery, arrays)

## Notes

- Use `deleteStorageFile()` for single images
- Use `deleteStorageFiles()` for arrays of images
- Always get existing data BEFORE deleting from database
- Handle errors gracefully - don't fail the main operation if storage cleanup fails
- Log storage cleanup operations for debugging

## Bucket Names Reference

```typescript
export const STORAGE_BUCKETS = {
  PRODUCTS: "product-images",
  BLOGS: "blog-images",
  CLASSES: "class-images",
  HERO: "hero-images",
  CATEGORIES: "category-images",
  TESTIMONIALS: "testimonial-images",
  ABOUT: "about-images",
  CRAFTED_MOMENTS: "crafted-moments",
  OUR_STORY: "our-story-images",
} as const;
```
