import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  TESTIMONIAL_BUCKET,
  ensureTestimonialImagesBucket,
  getAdminClient,
} from "@/lib/supabase/admin";
import { deleteStorageFile, STORAGE_BUCKETS } from "@/lib/supabase/storage-utils";

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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const name = String(formData.get("name") ?? "").trim();
    const location = String(formData.get("location") ?? "").trim();
    const imageAlt = String(formData.get("imageAlt") ?? "").trim();
    const rating = Number(formData.get("rating") ?? 0);
    const purchased = String(formData.get("purchased") ?? "").trim();
    const review = String(formData.get("review") ?? "").trim();
    const image = formData.get("image");

    if (!name || !location || !imageAlt || !rating || !purchased || !review) {
      return NextResponse.json(
        { error: "Name, location, image alt text, rating, purchased item, and review are required." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be a whole number between 1 and 5." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();

    // Fetch existing image_url before update
    const { data: existingTestimonial } = await supabase
      .from("testimonials")
      .select("image_url")
      .eq("id", id)
      .single();

    const updateData: {
      name: string;
      location: string;
      image_alt: string;
      rating: number;
      purchased: string;
      review: string;
      image_url?: string;
    } = {
      name,
      location,
      image_alt: imageAlt,
      rating,
      purchased,
      review,
    };

    if (image instanceof File) {
      // Delete old image from storage if exists
      if (existingTestimonial?.image_url) {
        await deleteStorageFile(existingTestimonial.image_url, STORAGE_BUCKETS.TESTIMONIALS);
      }
      const timestamp = Date.now();
      const safeName = slugify(name) || "testimonial";

      await ensureTestimonialImagesBucket();

      const extension = image.name.includes(".") ? image.name.split(".").pop() : "jpg";
      const filePath = `${safeName}/portrait-${timestamp}.${extension}`;
      const buffer = Buffer.from(await image.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(TESTIMONIAL_BUCKET)
        .upload(filePath, buffer, {
          contentType: image.type || "image/jpeg",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from(TESTIMONIAL_BUCKET).getPublicUrl(filePath);
      updateData.image_url = data.publicUrl;
    }

    const { data: updatedTestimonial, error: updateError } = await supabase
      .from("testimonials")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    return NextResponse.json(
      {
        testimonial: {
          id: updatedTestimonial.id,
          name: updatedTestimonial.name,
          location: updatedTestimonial.location,
          image_url: updatedTestimonial.image_url,
          image_alt: updatedTestimonial.image_alt,
          rating: updatedTestimonial.rating,
          purchased: updatedTestimonial.purchased,
          review: updatedTestimonial.review,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update testimonial." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabase = getAdminClient();

    // Fetch image_url before deleting the record
    const { data: testimonial } = await supabase
      .from("testimonials")
      .select("image_url")
      .eq("id", id)
      .single();

    const { error: deleteError } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // Delete associated image from storage
    if (testimonial?.image_url) {
      await deleteStorageFile(testimonial.image_url, STORAGE_BUCKETS.TESTIMONIALS);
    }

    return NextResponse.json(
      { message: "Testimonial deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to delete testimonial." },
      { status: 500 },
    );
  }
}
