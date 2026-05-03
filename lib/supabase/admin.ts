import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const CATEGORY_BUCKET = "category-thumbnails";

export const getAdminClient = () => {
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export const ensureCategoryThumbnailsBucket = async () => {
  const supabase = getAdminClient();

  const { error: bucketLookupError } = await supabase.storage.getBucket(CATEGORY_BUCKET);

  if (!bucketLookupError) {
    return;
  }

  const { error: createBucketError } = await supabase.storage.createBucket(
    CATEGORY_BUCKET,
    {
      public: true,
      allowedMimeTypes: ["image/*"],
      fileSizeLimit: "10485760",
    },
  );

  if (createBucketError) {
    if (createBucketError.message.toLowerCase().includes("already exists")) {
      return;
    }

    throw new Error(
      `Unable to create Supabase Storage bucket "${CATEGORY_BUCKET}": ${createBucketError.message}`,
    );
  }
};
