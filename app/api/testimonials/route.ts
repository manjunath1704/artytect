import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase public environment variables are not configured.");
      return NextResponse.json({ testimonials: [] }, { status: 200 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, name, location, image_url, image_alt, rating, purchased, review")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching testimonials:", error);
      return NextResponse.json({ testimonials: [] }, { status: 200 });
    }

    return NextResponse.json({
      testimonials: (data || []).map((testimonial) => ({
        id: testimonial.id,
        name: testimonial.name ?? "",
        location: testimonial.location ?? "",
        image: testimonial.image_url ?? "",
        imageAlt: testimonial.image_alt ?? `${testimonial.name} portrait`,
        rating: Number(testimonial.rating ?? 5),
        purchased: testimonial.purchased ?? "",
        review: testimonial.review ?? "",
      })),
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ testimonials: [] }, { status: 200 });
  }
}
