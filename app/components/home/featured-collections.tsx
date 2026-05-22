"use client";

import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CategoryCard from "./category-card";
import SectionHeader from "./section-header";
import ViewMoreLink from "./view-more-link";
const fallbackCollections = [
  {
    title: "Bowls",
    description: "Everyday forms with soft handles and warm glazes for slow mornings.",
    href: "/categories/bowls",
    thumbnailSrc: "/images/bowl-a.avif",
    hoverThumbnailSrc: "/images/bowl-b.avif",
  },
  {
    title: "Vases",
    description: "Low, balanced silhouettes that work beautifully for serving and display.",
    href: "/categories/vases",
    thumbnailSrc: "/images/vase-a.avif",
    hoverThumbnailSrc: "/images/vase-b.avif",
  },
  {
    title: "Mugs",
    description: "Tall statement pieces with clean necks and tactile surface variation.",
    href: "/categories/mugs",
    thumbnailSrc: "/images/mug-a.avif",
    hoverThumbnailSrc: "/images/mug-b.avif",
  },
  {
    title: "Planters",
    description: "Quiet sculptural accents that bring texture to shelves and tabletops.",
    href: "/categories/planters",
    thumbnailSrc: "/images/planter-a.avif",
    hoverThumbnailSrc: "/images/planter-b.avif",
  },
  {
    title: "Plates",
    description: "Quiet sculptural accents that bring texture to shelves and tabletops.",
    href: "/categories/plates",
    thumbnailSrc: "/images/plate-a.avif",
    hoverThumbnailSrc: "/images/plate-b.avif",
  },
  {
    title: "Deep plates",
    description: "Quiet sculptural accents that bring texture to shelves and tabletops.",
    href: "/categories/deep-plates",
    thumbnailSrc: "/images/deep-a.avif",
    hoverThumbnailSrc: "/images/deep-b.avif",
  },
];

type CategoryRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  hover_thumbnail_url: string;
};

type CollectionItem = {
  title: string;
  description: string;
  href: string;
  thumbnailSrc: string;
  hoverThumbnailSrc: string;
};

export type CategoriesSectionHeader = {
  eyebrow: string;
  title: string;
  description: string;
};

const fallbackHeader: CategoriesSectionHeader = {
  eyebrow: "Featured collections",
  title: "Find your everyday form",
  description:
    "Explore bowls, mugs, vases, planters, plates, and deep serving forms selected for a quiet home, tactile tables, and daily rituals.",
};

const FeaturedCollections = ({
  header = fallbackHeader,
}: {
  header?: CategoriesSectionHeader;
}) => {
  const [collections, setCollections] = useState<CollectionItem[]>(fallbackCollections);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      const response = await fetch("/api/categories");
      const result = (await response.json().catch(() => null)) as
        | { categories?: CategoryRow[] }
        | null;

      if (!isMounted || !response.ok || !result?.categories?.length) {
        return;
      }

      const nextCollections = result.categories.map((category: CategoryRow) => ({
        title: category.title,
        description: category.description,
        href: `/categories/${category.slug}`,
        thumbnailSrc: category.thumbnail_url,
        hoverThumbnailSrc: category.hover_thumbnail_url,
      }));

      setCollections(nextCollections);
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!api) return;

    const updateCarouselState = () => {
      setSelectedIndex(api.selectedScrollSnap());
      setScrollSnaps(api.scrollSnapList());
    };

    updateCarouselState();
    api.on("select", updateCarouselState);
    api.on("reInit", updateCarouselState);

    return () => {
      api.off("select", updateCarouselState);
      api.off("reInit", updateCarouselState);
    };
  }, [api]);

  return (
    <section
      id="collections"
      className="relative overflow-hidden bg-[#f6efe6] py-20 md:py-28"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(185,130,94,0.18),transparent_28%),radial-gradient(circle_at_88%_14%,rgba(154,107,78,0.12),transparent_30%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[#d8cabd]" />

      <div className="site-container relative">
       
 <SectionHeader
          id="featured-products-title"
          eyebrow={header.eyebrow}
          title={header.title}
          description={header.description}
          action={<ViewMoreLink href="/categories">View all categories</ViewMoreLink>}
        />
        <div className="mt-12 md:mt-14">
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
              dragFree: false,
            }}
            plugins={[
              Autoplay({
                delay: 2800,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="">
              {collections.map((collection, index) => (
                <CarouselItem
                  key={`${collection.title}-${index}`}
                  className="basis-[100%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/3"
                >
                  <CategoryCard
                    title={collection.title}
                    description={collection.description}
                    href={collection.href}
                    index={index + 1}
                    thumbnailSrc={collection.hoverThumbnailSrc}
                    hoverThumbnailSrc={collection.thumbnailSrc}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-10 flex flex-col items-center justify-between gap-5 sm:flex-row">
              <div className="flex items-center gap-2" aria-label="Collection slides">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={[
                      "h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a6b4e]/40",
                      selectedIndex === index
                        ? "w-9 bg-[#1b1511]"
                        : "w-2.5 bg-[#cdbbae] hover:bg-[#9a6b4e]",
                    ].join(" ")}
                    aria-label={`Go to collection slide ${index + 1}`}
                    aria-current={selectedIndex === index ? "true" : undefined}
                    onClick={() => api?.scrollTo(index)}
                  />
                ))}
              </div>
              <div className="flex gap-2 items-center">
                  <CarouselPrevious
                    className="static h-10 w-10 translate-y-0 rounded-l-full border-brand-text-primary bg-transparent text-brand-text-primary shadow-none hover:bg-brand-text-primary hover:text-[#fcfdfa] disabled:opacity-40 [&_svg]:!h-4 [&_svg]:!w-4"
                  />
                  <CarouselNext
                    className="static h-10 w-10 translate-y-0 rounded-r-full  border-brand-text-primary bg-transparent text-brand-text-primary shadow-none hover:bg-brand-text-primary hover:text-[#fcfdfa] disabled:opacity-40 [&_svg]:!h-4 [&_svg]:!w-4"
                  />
                </div>
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
