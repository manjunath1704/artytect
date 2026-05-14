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
    name: "Aarohi Mehta",
    role: "Tableware collector",
    image: "/images/rating-user.jpg",
    quote:
      "The mug feels handmade in the best way: balanced, warm, and quietly beautiful on my desk every morning.",
    piece: "Textured Mug",
  },
  {
    name: "Nikhil Rao",
    role: "Home stylist",
    image: "/images/rating-user.jpg",
    quote:
      "I ordered two planters over WhatsApp and the whole process felt personal. The pieces arrived exactly as shown.",
    piece: "Studio Planter",
  },
  {
    name: "Mira Thomas",
    role: "Workshop student",
    image: "/images/rating-user.jpg",
    quote:
      "The wheel class was calm, clear, and generous. I left with pieces I actually wanted to keep.",
    piece: "Wheel Throwing Basics",
  },
  {
    name: "Kabir Sethi",
    role: "Ceramic buyer",
    image: "/images/rating-user.jpg",
    quote:
      "The bowls have a quiet weight and finish that makes simple meals feel considered.",
    piece: "Wood Fired Bowl",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="w-full bg-[#1b1511] py-20 text-white md:py-24">
      <div className="site-container">
        <div className="mb-12 grid gap-6 md:grid-cols-[0.82fr_1fr] md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8b99c]">
              Studio notes
            </p>
            <h2 className="mt-3 text-4xl font-display uppercase leading-none tracking-normal md:text-5xl">
              Loved in daily use
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[#d9c8b8] md:justify-self-end">
            Notes from customers and students who brought Artytect pieces into
            their kitchens, shelves, and weekend studio practice.
          </p>
        </div>

        <Carousel
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
          className="w-full py-5"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((item, index) => (
              <CarouselItem
                key={`${item.name}-${index}`}
                className="basis-full pl-4 md:basis-1/2"
              >
                <article className="grid h-full min-h-[260px] border border-white/14 bg-white/[0.06] p-6 backdrop-blur md:grid-cols-[112px_1fr] md:p-8">
                  <div>
                    <div className="relative h-24 w-24 overflow-hidden bg-[#342820]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover object-top"
                      />
                    </div>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#d8b99c]">
                      0{index + 1}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-white/14 pt-6 md:mt-0 md:border-l md:border-t-0 md:pl-7 md:pt-0">
                    <p className="text-xl font-display leading-8 text-[#fff8f1]">
                      <span aria-hidden="true">“</span>
                      {item.quote}
                      <span aria-hidden="true">”</span>
                    </p>
                    <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.16em]">
                          {item.name}
                        </h3>
                        <p className="mt-2 text-xs text-[#c8b7a8]">{item.role}</p>
                      </div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#d8b99c]">
                        {item.piece}
                      </p>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-10 flex items-center justify-end">
            <CarouselPrevious className="static h-8 w-8 translate-y-0 rounded-none border-[#d8b99c] bg-transparent text-[#d8b99c] shadow-none hover:bg-[#d8b99c] hover:text-[#1b1511] disabled:opacity-40 sm:h-9 sm:w-9 [&_svg]:!h-4 [&_svg]:!w-4" />
            <CarouselNext className="static h-8 w-8 translate-y-0 rounded-none border-l-0 border-[#d8b99c] bg-transparent text-[#d8b99c] shadow-none hover:bg-[#d8b99c] hover:text-[#1b1511] disabled:opacity-40 sm:h-9 sm:w-9 [&_svg]:!h-4 [&_svg]:!w-4" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
