"use client";

import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

import ProductCard from "@/app/components/cards/product-card";
import { products } from "@/lib/products";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { FeaturedEmptyState, FeaturedGridSkeleton } from "./featured-section-states";
import SectionHeader from "./section-header";
import ViewMoreLink from "./view-more-link";

type FeaturedProductsSectionProps = {
  isLoading?: boolean;
};

export default function FeaturedProductsSection({
  isLoading = false,
}: FeaturedProductsSectionProps) {
  const featuredProducts = products.filter((item) => item.featured);
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

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
    <section className="bg-[#fbf8f4] py-20 md:py-28" aria-labelledby="featured-products-title">
      <div className="site-container">
        <SectionHeader
          id="featured-products-title"
          eyebrow="Featured products"
          title="Pieces made for everyday rituals"
          description="A curated edit of handmade forms with tactile finishes, quiet silhouettes, and WhatsApp ordering kept one tap away."
          action={<ViewMoreLink href="/products">View More Products</ViewMoreLink>}
        />

        {isLoading ? <FeaturedGridSkeleton /> : null}

        {!isLoading && featuredProducts.length ? (
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
                  delay: 3200,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent>
                {featuredProducts.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-[100%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/3"
                  >
                    <ProductCard
                      product={product}
                      imageSizes="(min-width: 1280px) 30vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="mt-10 flex flex-col items-center justify-between gap-5 sm:flex-row">
                <div className="flex items-center gap-2" aria-label="Product slides">
                  {scrollSnaps.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={[
                        "h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-text-accent/40",
                        selectedIndex === index
                          ? "w-9 bg-brand-text-primary"
                          : "w-2.5 bg-[#cdbbae] hover:bg-brand-text-accent",
                      ].join(" ")}
                      aria-label={`Go to product slide ${index + 1}`}
                      aria-current={selectedIndex === index ? "true" : undefined}
                      onClick={() => api?.scrollTo(index)}
                    />
                  ))}
                </div>

                <div className="flex gap-3 items-center">
                  <CarouselPrevious
                    className="static h-10 w-10 translate-y-0 rounded-l-full border-brand-text-primary bg-transparent text-brand-text-primary shadow-none hover:bg-brand-text-primary hover:text-[#fcfdfa] disabled:opacity-40 [&_svg]:!h-4 [&_svg]:!w-4"
                  />
                  <CarouselNext
                    className="static h-10 w-10 translate-y-0 rounded-r-full border-brand-text-primary bg-transparent text-brand-text-primary shadow-none hover:bg-brand-text-primary hover:text-[#fcfdfa] disabled:opacity-40 [&_svg]:!h-4 [&_svg]:!w-4"
                  />
                </div>
              </div>
            </Carousel>
          </div>
        ) : null}

        {!isLoading && !featuredProducts.length ? (
          <FeaturedEmptyState
            title="No featured products yet"
            description="Mark products as featured to show them on the homepage."
          />
        ) : null}
      </div>
    </section>
  );
}
