import Navbar from "./components/home/navbar";
import Hero from "./components/home/hero";
import FeaturedCollections from "./components/home/featured-collections";
import FeaturedClassesSection from "./components/home/featured-classes";
import FeaturedProductsSection from "./components/home/featured-products";
import AboutSection from "./components/home/about";
import TestimonialsSection from "./components/home/testimonials";
import CraftsmanshipProcess from "./components/home/craftsmanship-process";
import GalleryApp from "./components/home/gallery";
import Footer from "./components/home/footer";
import { testimonials as fallbackTestimonials, type Testimonial } from "@/data/testimonials";
import { createClient } from "@/lib/supabase/server";

async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, location, image_url, image_alt, rating, purchased, review")
    .order("created_at", { ascending: false });

  if (error || !data?.length) {
    return fallbackTestimonials;
  }

  return data.map((testimonial) => ({
    id: testimonial.id,
    name: testimonial.name ?? "",
    location: testimonial.location ?? "",
    image: testimonial.image_url ?? "/images/rating-user.jpg",
    imageAlt: testimonial.image_alt ?? `${testimonial.name} portrait`,
    rating: Number(testimonial.rating ?? 5),
    purchased: testimonial.purchased ?? "",
    review: testimonial.review ?? "",
  }));
}

export default async function Page() {
  const testimonials = await getTestimonials();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedCollections />
        <FeaturedProductsSection />
        <FeaturedClassesSection />
        <AboutSection/>
        <CraftsmanshipProcess/>
        <TestimonialsSection testimonials={testimonials}/>
        <GalleryApp/>
      </main>
      <Footer />
    </>
  );
}
