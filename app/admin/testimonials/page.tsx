import { redirect } from "next/navigation";

import TestimonialsManager from "./testimonials-manager";
import { AdminLayout } from "../admin-layout";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TestimonialRow = {
  id: string;
  name: string;
  location: string;
  image_url: string;
  image_alt: string;
  rating: number;
  purchased: string;
  review: string;
};

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const { data: testimonialsData, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false });

  const testimonials: TestimonialRow[] = error
    ? []
    : (testimonialsData || []).map((testimonial) => ({
        id: String(testimonial.id),
        name: testimonial.name || "",
        location: testimonial.location || "",
        image_url: testimonial.image_url || "",
        image_alt: testimonial.image_alt || "",
        rating: Number(testimonial.rating || 5),
        purchased: testimonial.purchased || "",
        review: testimonial.review || "",
      }));

  return (
    <AdminLayout userEmail={data.user.email ?? ""}>
      <TestimonialsManager
        initialUserEmail={data.user.email ?? ""}
        initialTestimonials={testimonials}
      />
    </AdminLayout>
  );
}
