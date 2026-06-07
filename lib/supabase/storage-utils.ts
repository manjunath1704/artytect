import { getAdminClient } from "./admin";

/**
 * Extract the file path from a Supabase storage URL
 * @param url - Full Supabase storage URL
 * @param bucketName - The storage bucket name
 * @returns The file path within the bucket, or null if not a valid Supabase URL
 */
export function extractStoragePathFromUrl(url: string, bucketName: string): string | null {
  if (!url) return null;

  try {
    // Handle both old and new Supabase storage URL formats
    // Format 1: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
    // Format 2: https://[project].supabase.co/storage/v1/object/authenticated/[bucket]/[path]
    const patterns = [
      new RegExp(`/storage/v1/object/public/${bucketName}/(.+)$`),
      new RegExp(`/storage/v1/object/authenticated/${bucketName}/(.+)$`),
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    }

    return null;
  } catch (error) {
    console.error("Error extracting storage path:", error);
    return null;
  }
}

/**
 * Delete a single file from Supabase storage
 * @param url - Full Supabase storage URL
 * @param bucketName - The storage bucket name
 * @returns true if deleted successfully, false otherwise
 */
export async function deleteStorageFile(url: string, bucketName: string): Promise<boolean> {
  if (!url) return false;

  const filePath = extractStoragePathFromUrl(url, bucketName);
  if (!filePath) return false;

  try {
    const supabase = getAdminClient();
    const { error } = await supabase.storage.from(bucketName).remove([filePath]);
    if (error) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete multiple files from Supabase storage
 * @param urls - Array of full Supabase storage URLs
 * @param bucketName - The storage bucket name
 * @returns Number of files successfully deleted
 */
export async function deleteStorageFiles(urls: string[], bucketName: string): Promise<number> {
  if (!urls || urls.length === 0) return 0;

  const filePaths = urls
    .map((url) => extractStoragePathFromUrl(url, bucketName))
    .filter((path): path is string => path !== null);

  if (filePaths.length === 0) return 0;

  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase.storage.from(bucketName).remove(filePaths);

    if (error) {
      console.error("Error deleting files from storage:", error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error("Error deleting files from storage:", error);
    return 0;
  }
}

/**
 * Delete an entire folder from Supabase storage
 * @param folderPath - The folder path to delete (e.g., "product-slug")
 * @param bucketName - The storage bucket name
 * @returns true if deleted successfully, false otherwise
 */
export async function deleteStorageFolder(folderPath: string, bucketName: string): Promise<boolean> {
  if (!folderPath) return false;

  try {
    const supabase = getAdminClient();
    
    // List all files in the folder
    const { data: files, error: listError } = await supabase.storage
      .from(bucketName)
      .list(folderPath);

    if (listError) {
      console.error("Error listing folder contents:", listError);
      return false;
    }

    if (!files || files.length === 0) {
      return true; // Folder is already empty or doesn't exist
    }

    // Build full paths for all files in the folder
    const filePaths = files.map((file) => `${folderPath}/${file.name}`);

    // Delete all files
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);

    if (deleteError) {
      console.error("Error deleting folder contents:", deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting folder:", error);
    return false;
  }
}

/**
 * Delete old image if a new one is provided
 * @param oldUrl - The old image URL to delete
 * @param newFile - The new file being uploaded (if null, don't delete old)
 * @param bucketName - The storage bucket name
 */
export async function replaceStorageFile(
  oldUrl: string | null,
  newFile: File | null,
  bucketName: string
): Promise<void> {
  // Only delete old file if we have a new file to replace it with
  if (oldUrl && newFile) {
    await deleteStorageFile(oldUrl, bucketName);
  }
}

/**
 * Bucket names used across the application
 */
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
  CONTACT: "contact-page-images",
} as const;
