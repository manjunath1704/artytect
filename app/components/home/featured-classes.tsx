"use client";

import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

import ClassCard from "@/app/components/cards/class-card";
import { potteryClasses } from "@/lib/classes";
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

type FeaturedClassesSectionProps = {
  isLoading?: boolean;
};

export default function FeaturedClassesSection({
  isLoading = false,
}: FeaturedClassesSectionProps) {
  const featuredClasses = potteryClasses.filter((item) => item.featured);
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
    <section className="bg-[#fff7f4] py-20 md:py-28" aria-labelledby="featured-classes-title">
      <div className="site-container">
        <SectionHeader
          id="featured-classes-title"
          eyebrow="Studio classes"
          title="Learn the rhythm of clay"
          description="Small-group classes for wheel throwing, handbuilding, and surface work, built for generous instruction and calm studio time."
          action={<ViewMoreLink href="/classes">View More Classes</ViewMoreLink>}
        />

        {isLoading ? <FeaturedGridSkeleton /> : null}

        {!isLoading && featuredClasses.length ? (
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
                  delay: 3500,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent >
                {featuredClasses.map((classItem, index) => (
                  <CarouselItem
                    key={classItem.slug}
                    className="basis-[100%] sm:basis-1/2 lg:basis-1/3 xl:basis-1/3"
                  >
                    <ClassCard
                      classItem={classItem}
                      index={index + 1}
                      imageSizes="(min-width: 1280px) 30vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>

              <div className="mt-10 flex flex-col items-center justify-between gap-5 sm:flex-row">
                <div className="flex items-center gap-2" aria-label="Class slides">
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
                      aria-label={`Go to class slide ${index + 1}`}
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

        {!isLoading && !featuredClasses.length ? (
          <FeaturedEmptyState
            title="No featured classes yet"
            description="Mark classes as featured to show them on the homepage."
          />
        ) : null}
      </div>
    </section>
  );
}
