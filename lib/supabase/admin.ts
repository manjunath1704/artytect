import "server-only";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const CATEGORY_BUCKET = "category-thumbnails";
export const TESTIMONIAL_BUCKET = "testimonial-images";
export const ABOUT_BUCKET = "about-section-images";
export const PROCESS_BUCKET = "process-step-images";
export const CRAFTED_MOMENTS_BUCKET = "crafted-moments-media";
export const HERO_BUCKET = "hero-media";

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

export const ensureTestimonialImagesBucket = async () => {
  const supabase = getAdminClient();

  const { error: bucketLookupError } = await supabase.storage.getBucket(TESTIMONIAL_BUCKET);

  if (!bucketLookupError) {
    return;
  }

  const { error: createBucketError } = await supabase.storage.createBucket(
    TESTIMONIAL_BUCKET,
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
      `Unable to create Supabase Storage bucket "${TESTIMONIAL_BUCKET}": ${createBucketError.message}`,
    );
  }
};

export const ensureAboutSectionImagesBucket = async () => {
  const supabase = getAdminClient();

  const { error: bucketLookupError } = await supabase.storage.getBucket(ABOUT_BUCKET);

  if (!bucketLookupError) {
    return;
  }

  const { error: createBucketError } = await supabase.storage.createBucket(
    ABOUT_BUCKET,
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
      `Unable to create Supabase Storage bucket "${ABOUT_BUCKET}": ${createBucketError.message}`,
    );
  }
};

export const ensureProcessStepImagesBucket = async () => {
  const supabase = getAdminClient();

  const { error: bucketLookupError } = await supabase.storage.getBucket(PROCESS_BUCKET);

  if (!bucketLookupError) {
    return;
  }

  const { error: createBucketError } = await supabase.storage.createBucket(
    PROCESS_BUCKET,
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
      `Unable to create Supabase Storage bucket "${PROCESS_BUCKET}": ${createBucketError.message}`,
    );
  }
};

export const ensureCraftedMomentsMediaBucket = async () => {
  const supabase = getAdminClient();

  const { error: bucketLookupError } = await supabase.storage.getBucket(CRAFTED_MOMENTS_BUCKET);

  if (!bucketLookupError) {
    return;
  }

  const { error: createBucketError } = await supabase.storage.createBucket(
    CRAFTED_MOMENTS_BUCKET,
    {
      public: true,
      allowedMimeTypes: ["image/*", "video/*"],
      fileSizeLimit: "52428800",
    },
  );

  if (createBucketError) {
    if (createBucketError.message.toLowerCase().includes("already exists")) {
      return;
    }

    throw new Error(
      `Unable to create Supabase Storage bucket "${CRAFTED_MOMENTS_BUCKET}": ${createBucketError.message}`,
    );
  }
};

export const ensureHeroMediaBucket = async () => {
  const supabase = getAdminClient();

  const { error: bucketLookupError } = await supabase.storage.getBucket(HERO_BUCKET);

  if (!bucketLookupError) {
    return;
  }

  const { error: createBucketError } = await supabase.storage.createBucket(
    HERO_BUCKET,
    {
      public: true,
      allowedMimeTypes: ["image/*", "video/*"],
      fileSizeLimit: "52428800",
    },
  );

  if (createBucketError) {
    if (createBucketError.message.toLowerCase().includes("already exists")) {
      return;
    }

    throw new Error(
      `Unable to create Supabase Storage bucket "${HERO_BUCKET}": ${createBucketError.message}`,
    );
  }
};
