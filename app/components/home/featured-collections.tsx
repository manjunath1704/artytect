"use client";

import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CategoryCard from "./category-card";

const collections = [
  {
    title: "Mugs",
    description: "Everyday forms with soft handles and warm glazes for slow mornings.",
    //accent: "from-[#d9c4b0] via-[#ede4d7] to-[#a56c4c]",
    href: "#shop",
  },
  {
    title: "Bowls",
    description: "Low, balanced silhouettes that work beautifully for serving and display.",
    //accent: "from-[#d8d7cd] via-[#f0ede4] to-[#8f9c83]",
    href: "#shop",
  },
  {
    title: "Vases",
    description: "Tall statement pieces with clean necks and tactile surface variation.",
   // accent: "from-[#e7d2b9] via-[#f4ede2] to-[#c28a61]",
    href: "#shop",
  },
  {
    title: "Decor",
    description: "Quiet sculptural accents that bring texture to shelves and tabletops.",
   // accent: "from-[#e3ddd2] via-[#f6f1e8] to-[#80725f]",
    href: "#shop",
  },
];

const FeaturedCollections = () => {
  return (
    <section id="collections" className="px-6 py-20 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
            Featured collections
          </p>
          <h2 className="mt-4 max-w-2xl text-4xl font-display tracking-[-0.05em] text-[#1b1511] sm:text-5xl lg:text-6xl">
            Categories shaped for everyday rituals and calm interiors.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#665b4f] sm:text-lg">
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
                  key={collection.title}
                  className="basis-[88%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/3"
                >
                  <CategoryCard
                    title={collection.title}
                    description={collection.description}
                   // accent={collection.accent}
                    href={collection.href}
                    index={index + 1}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="mt-8 flex items-center justify-end gap-3">
              <CarouselPrevious />
              <CarouselNext />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
