"use client";

import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";

import SectionHeader from "@/app/components/home/section-header";
import TestimonialCard from "@/app/components/home/testimonial-card";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { testimonials } from "@/data/testimonials";

export default function TestimonialsSection() {
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
    <section
      className="relative overflow-hidden bg-[#f4efe6] py-20 text-[#1b1511] md:py-24"
      aria-labelledby="testimonials-title"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(185,130,94,0.16),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(154,107,78,0.12),transparent_28%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[#d8cabd]" />

      <div className="site-container relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <SectionHeader
            id="testimonials-title"
            eyebrow="Community stories"
            title="Stories From Our Pottery Community"
            description="Notes from collectors, students, and home stylists who brought Artytect pieces into their rituals, shelves, and studio practice."
          />
        </motion.div>

        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
            dragFree: false,
          }}
          plugins={[
            Autoplay({
              delay: 3800,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          className="w-full"
        >
          <CarouselContent className="-ml-5">
            {testimonials.map((testimonial, index) => (
              <CarouselItem
                key={testimonial.id}
                className="basis-[88%] pl-5 sm:basis-[62%] lg:basis-1/3"
              >
                <TestimonialCard testimonial={testimonial} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-10 flex flex-col items-center justify-between gap-5 sm:flex-row">
            <div className="flex items-center gap-2" aria-label="Testimonial slides">
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
                  aria-label={`Go to testimonial slide ${index + 1}`}
                  aria-current={selectedIndex === index ? "true" : undefined}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>

            <div className="flex items-center">
              <CarouselPrevious className="static h-10 w-10 translate-y-0 rounded-none border-[#1b1511] bg-transparent text-[#1b1511] shadow-none hover:bg-[#1b1511] hover:text-[#fffaf3] disabled:opacity-40 [&_svg]:!h-4 [&_svg]:!w-4" />
              <CarouselNext className="static h-10 w-10 translate-y-0 rounded-none border-l-0 border-[#1b1511] bg-transparent text-[#1b1511] shadow-none hover:bg-[#1b1511] hover:text-[#fffaf3] disabled:opacity-40 [&_svg]:!h-4 [&_svg]:!w-4" />
            </div>
          </div>
        </Carousel>
      </div>
    </section>
  );
}
