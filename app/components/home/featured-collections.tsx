"use client";

import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

import {
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

  return (
    <section id="collections" className="py-20">
      <div className="site-container">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <h2 className="max-w-2xl text-4xl font-display tracking-[-0.05em] text-[#1b1511] sm:text-5xl lg:text-6xl">
            Categories
          </h2>
          <p className="max-w-2xl text-base leading-8 text-[#665b4f] sm:text-lg">
            Explore a concise selection of mugs, bowls, vases, and decor pieces designed
            with a restrained, earthy palette and a premium finish.
          </p>
        </div>

        <div className="mt-12">
          <Carousel
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
            <CarouselContent>
              {collections.map((collection, index) => (
                <CarouselItem
                  key={`${collection.title}-${index}`}
                  className="basis-[88%] sm:basis-1/2 lg:basis-1/4 xl:basis-1/4"
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

            <div className="mt-10 flex items-center justify-end">
              <CarouselPrevious
                className="static h-8 w-8 translate-y-0 rounded-none border-[#1b1511] bg-transparent text-[#1b1511] shadow-[0_16px_32px_rgba(27,21,17,0.12)] hover:bg-[#1b1511] hover:text-[#fcfdfa] disabled:opacity-40 sm:h-9 sm:w-9 [&_svg]:!h-4 [&_svg]:!w-4"
              />
              <CarouselNext
                className="static h-8 w-8 translate-y-0 rounded-none border-l-0 border-[#1b1511] bg-transparent text-[#1b1511] shadow-[0_16px_32px_rgba(27,21,17,0.12)] hover:bg-[#1b1511] hover:text-[#fcfdfa] disabled:opacity-40 sm:h-9 sm:w-9 [&_svg]:!h-4 [&_svg]:!w-4"
              />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
