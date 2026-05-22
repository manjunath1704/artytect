import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import {
  TESTIMONIAL_BUCKET,
  ensureTestimonialImagesBucket,
  getAdminClient,
} from "@/lib/supabase/admin";

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
  try {
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

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a testimonial image." },
        { status: 400 },
      );
    }

    const supabase = getAdminClient();
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

    const { data: publicUrlData } = supabase.storage
      .from(TESTIMONIAL_BUCKET)
      .getPublicUrl(filePath);

    const { data: insertedTestimonial, error: insertError } = await supabase
      .from("testimonials")
      .insert({
        name,
        location,
        image_url: publicUrlData.publicUrl,
        image_alt: imageAlt,
        rating,
        purchased,
        review,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json(
      {
        testimonial: {
          id: insertedTestimonial.id,
          name: insertedTestimonial.name,
          location: insertedTestimonial.location,
          image_url: insertedTestimonial.image_url,
          image_alt: insertedTestimonial.image_alt,
          rating: insertedTestimonial.rating,
          purchased: insertedTestimonial.purchased,
          review: insertedTestimonial.review,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to create testimonial." },
      { status: 500 },
    );
  }
}
