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

const FeaturedCollections = () => {
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
        <div className="grid gap-6 border-b border-[#d8cabd] pb-8 md:grid-cols-[0.78fr_1fr] md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a6b4e]">
              Featured collections
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-display uppercase leading-none tracking-normal text-[#1b1511] sm:text-5xl lg:text-7xl">
              Find your everyday form
            </h2>
          </div>
          <div className="max-w-2xl md:justify-self-end">
            <p className="text-sm leading-7 text-[#665b4f]">
              Explore bowls, mugs, vases, planters, plates, and deep serving
              forms selected for a quiet home, tactile tables, and daily rituals.
            </p>
            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">
              Curated by clay, glaze, and daily ritual
            </p>
          </div>
        </div>

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
            className="w-full py-5"
          >
            <CarouselContent className="-ml-5">
              {collections.map((collection, index) => (
                <CarouselItem
                  key={`${collection.title}-${index}`}
                  className="basis-[88%] pl-5 sm:basis-[54%] lg:basis-1/3 xl:basis-1/3"
                >
                  <CategoryCard
                    title={collection.title}
                    description={collection.description}
                    href={collection.href}
                    index={index + 1}
                    thumbnailSrc={collection.thumbnailSrc}
                    hoverThumbnailSrc={collection.hoverThumbnailSrc}
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
                      "h-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a6b4e]/40",
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

              <div className="flex items-center">
                <CarouselPrevious
                  className="static h-10 w-10 translate-y-0 rounded-none border-[#1b1511] bg-transparent text-[#1b1511] shadow-none hover:bg-[#1b1511] hover:text-[#fcfdfa] disabled:opacity-40 [&_svg]:!h-4 [&_svg]:!w-4"
                />
                <CarouselNext
                  className="static h-10 w-10 translate-y-0 rounded-none border-l-0 border-[#1b1511] bg-transparent text-[#1b1511] shadow-none hover:bg-[#1b1511] hover:text-[#fcfdfa] disabled:opacity-40 [&_svg]:!h-4 [&_svg]:!w-4"
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
