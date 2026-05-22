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

type TestimonialsHeader = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
};

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/admin/login");
  }

  const [{ data: header }, { data: testimonialsData, error }] = await Promise.all([
    supabase
      .from("testimonials_sections")
      .select("id, eyebrow, title, description")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

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
        initialHeader={{
          id: header?.id ? String(header.id) : undefined,
          eyebrow: header?.eyebrow || "Community stories",
          title: header?.title || "Stories From Our Pottery Community",
          description:
            header?.description ||
            "Notes from collectors, students, and home stylists who brought Haritham pieces into their rituals, shelves, and studio practice.",
        } satisfies TestimonialsHeader}
        initialTestimonials={testimonials}
      />
    </AdminLayout>
  );
}
