import Navbar from "./components/home/navbar";
import Hero from "./components/home/hero";
import FeaturedCollections, {
  type CategoriesSectionHeader,
} from "./components/home/featured-collections";
import FeaturedClassesSection from "./components/home/featured-classes";
import FeaturedProductsSection from "./components/home/featured-products";
import AboutSection from "./components/home/about";
import TestimonialsSection, {
  type TestimonialsSectionHeader,
} from "./components/home/testimonials";
import CraftsmanshipProcess, {
  type ProcessHeader,
  type ProcessStep,
} from "./components/home/craftsmanship-process";
import GalleryApp, {
  type CraftedMomentItem,
  type CraftedMomentsHeader,
} from "./components/home/gallery";
import Footer from "./components/home/footer";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type ProcessSectionData = {
  header: ProcessHeader;
  steps: ProcessStep[];
};

type CraftedMomentsData = {
  header: CraftedMomentsHeader;
  items: CraftedMomentItem[];
};

type CategoriesSectionData = {
  header: CategoriesSectionHeader;
};

type TestimonialsSectionData = {
  header: TestimonialsSectionHeader;
};

function getPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getProcessSection(): Promise<ProcessSectionData> {
  const fallbackHeader = {
    eyebrow: "The Process",
    title: "Crafting timeless ceramics with soul",
  };
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return { header: fallbackHeader, steps: [] };
  }

  const [{ data: header, error: headerError }, { data: steps, error: stepsError }] =
    await Promise.all([
      supabase
        .from("process_sections")
        .select("id, eyebrow, title")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("process_steps")
        .select("id, title, description, image_url, image_alt, sort_order")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

  if (headerError) console.error("Error fetching process header:", headerError);
  if (stepsError) console.error("Error fetching process steps:", stepsError);

  return {
    header: headerError
      ? fallbackHeader
      : {
          eyebrow: header?.eyebrow || fallbackHeader.eyebrow,
          title: header?.title || fallbackHeader.title,
        },
    steps: stepsError
      ? []
      : (steps ?? [])
          .filter((step) => step.title && step.description && step.image_url)
          .map((step) => ({
            id: step.id,
            title: step.title,
            description: step.description,
            image: step.image_url,
            imageAlt: step.image_alt || step.title,
            sortOrder: Number(step.sort_order || 0),
          })),
  };
}

async function getCategoriesSection(): Promise<CategoriesSectionData> {
  const fallbackHeader = {
    eyebrow: "Featured collections",
    title: "Find your everyday form",
    description:
      "Explore bowls, mugs, vases, planters, plates, and deep serving forms selected for a quiet home, tactile tables, and daily rituals.",
  };
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return { header: fallbackHeader };
  }

  const { data: header, error } = await supabase
    .from("categories_sections")
    .select("id, eyebrow, title, description")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) console.error("Error fetching categories section:", error);

  return {
    header: error
      ? fallbackHeader
      : {
          eyebrow: header?.eyebrow || fallbackHeader.eyebrow,
          title: header?.title || fallbackHeader.title,
          description: header?.description || fallbackHeader.description,
        },
  };
}

async function getTestimonialsSection(): Promise<TestimonialsSectionData> {
  const fallbackHeader = {
    eyebrow: "Community stories",
    title: "Stories From Our Pottery Community",
    description:
      "Notes from collectors, students, and home stylists who brought Haritham pieces into their rituals, shelves, and studio practice.",
  };
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return { header: fallbackHeader };
  }

  const { data: header, error } = await supabase
    .from("testimonials_sections")
    .select("id, eyebrow, title, description")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) console.error("Error fetching testimonials section:", error);

  return {
    header: error
      ? fallbackHeader
      : {
          eyebrow: header?.eyebrow || fallbackHeader.eyebrow,
          title: header?.title || fallbackHeader.title,
          description: header?.description || fallbackHeader.description,
        },
  };
}

async function getCraftedMoments(): Promise<CraftedMomentsData> {
  const fallbackHeader = {
    eyebrow: "Crafted moments",
    title: "Inside Our Pottery Studio",
    description:
      "A cinematic glimpse into the artistry, craftsmanship, and soulful process behind every handmade ceramic piece.",
  };
  const supabase = getPublicSupabaseClient();

  if (!supabase) {
    return { header: fallbackHeader, items: [] };
  }

  const [{ data: header, error: headerError }, { data: items, error: itemsError }] =
    await Promise.all([
      supabase
        .from("crafted_moments_sections")
        .select("id, eyebrow, title, description")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("crafted_moments_items")
        .select("id, type, title, caption, media_url, poster_url, label, is_featured, sort_order")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

  if (headerError) console.error("Error fetching crafted moments header:", headerError);
  if (itemsError) console.error("Error fetching crafted moments items:", itemsError);

  return {
    header: headerError
      ? fallbackHeader
      : {
          eyebrow: header?.eyebrow || fallbackHeader.eyebrow,
          title: header?.title || fallbackHeader.title,
          description: header?.description || fallbackHeader.description,
        },
    items: itemsError
      ? []
      : (items ?? [])
          .filter(
            (item) =>
              (item.type === "image" || item.type === "video") &&
              item.title &&
              item.caption &&
              item.media_url,
          )
          .map((item) => ({
            id: item.id,
            type: item.type,
            title: item.title,
            caption: item.caption,
            mediaUrl: item.media_url,
            posterUrl: item.poster_url || undefined,
            label: item.label || (item.is_featured ? "Featured process" : "Studio study"),
            isFeatured: Boolean(item.is_featured),
            sortOrder: Number(item.sort_order || 0),
          })),
  };
}

export default async function Page() {
  const [categoriesSection, processSection, testimonialsSection, craftedMoments] = await Promise.all([
    getCategoriesSection(),
    getProcessSection(),
    getTestimonialsSection(),
    getCraftedMoments(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedCollections header={categoriesSection.header} />
        <FeaturedProductsSection />
        <FeaturedClassesSection />
        <AboutSection/>
        <CraftsmanshipProcess
          header={processSection.header}
          steps={processSection.steps}
        />
        <TestimonialsSection header={testimonialsSection.header}/>
        <GalleryApp
          header={craftedMoments.header}
          items={craftedMoments.items}
        />
      </main>
      <Footer />
    </>
  );
}
