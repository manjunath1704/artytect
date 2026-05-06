"use client";

import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
const testimonials = [
  {
    name: "Jenny Wilson",
    role: "Miles, Esther",
    image: "/images/rating-user.jpg",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eu rhoncus urna facilisis quisque orci lectus sed nulla amet.",
    bg: "bg-[#d9d6cc]",
  },
  {
    name: "Devon Lane",
    role: "Flores, Juanita",
    image: "/images/rating-user.jpg",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit quisque orci lectus sed nulla amet.",
    bg: "bg-[#c6dbe3]",
  },
  {
    name: "Robert Fox",
    role: "Designer",
    image: "/images/rating-user.jpg",
    quote:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.",
    bg: "bg-[#e7d6cc]",
  },
  {
    name: "Jenny Wilson",
    role: "Miles, Esther",
    image: "/images/rating-user.jpg",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In eu rhoncus urna facilisis quisque orci lectus sed nulla amet.",
    bg: "bg-[#d9d6cc]",
  },
  {
    name: "Devon Lane",
    role: "Flores, Juanita",
    image: "/images/rating-user.jpg",
    quote:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit quisque orci lectus sed nulla amet.",
    bg: "bg-[#c6dbe3]",
  },
  {
    name: "Robert Fox",
    role: "Designer",
    image: "/images/rating-user.jpg",
    quote:
      "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.",
    bg: "bg-[#e7d6cc]",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full bg-[#fcfdfa] py-20 px-6 md:px-16">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-serif">
          What our client say
        </h2>
      </div>

      <Carousel opts={{
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
                  className="w-full py-5">
        <CarouselContent className="-ml-4">
          {testimonials.map((item, index) => (
            <CarouselItem
              key={index}
              className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
            >
              <div className={`p-8 ${item.bg} text-black flex gap-6 min-h-[220px] h-full`}>
                
                {/* LEFT */}
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="w-26 h-26 overflow-hidden mb-2">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover object-top aspect-square"
                    />
                  </div>

                  <h4 className="text-base font-semibold">
                    {item.name}
                  </h4>
                  <span className="text-xs text-neutral-600">
                    {item.role}
                  </span>
                </div>

                {/* DIVIDER */}
                <div className="w-px border-l border-dashed border-neutral-400" />

                {/* TEXT */}
                <p className="text-base text-neutral-700 leading-relaxed">
                  {item.quote}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* OPTIONAL NAV */}
        <div className="mt-10 flex items-center justify-end">
          <CarouselPrevious className="static h-8 w-8 translate-y-0 rounded-none border-[#1b1511] bg-transparent text-[#1b1511] shadow-[0_16px_32px_rgba(27,21,17,0.12)] hover:bg-[#1b1511] hover:text-[#fcfdfa] disabled:opacity-40 sm:h-9 sm:w-9 [&_svg]:!h-4 [&_svg]:!w-4" />
          <CarouselNext className="static h-8 w-8 translate-y-0 rounded-none border-l-0 border-[#1b1511] bg-transparent text-[#1b1511] shadow-[0_16px_32px_rgba(27,21,17,0.12)] hover:bg-[#1b1511] hover:text-[#fcfdfa] disabled:opacity-40 sm:h-9 sm:w-9 [&_svg]:!h-4 [&_svg]:!w-4" />
        </div>
      </Carousel>
    </section>
  );
}
