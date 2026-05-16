"use client";

import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { motion } from "framer-motion";

import type { Testimonial } from "@/data/testimonials";

type TestimonialCardProps = {
  testimonial: Testimonial;
  index: number;
};

export default function TestimonialCard({
  testimonial,
  index,
}: TestimonialCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-[#e3d2c3] bg-[#fffdf8] p-5 shadow-sm transition-shadow duration-300 hover:shadow-md md:p-6"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 rounded-t-[32px] bg-[linear-gradient(90deg,#b9825e,#d8b99c,#8f6f53)] opacity-80" />
      <Quote
        className="absolute right-6 top-7 h-10 w-10 text-[#d8b99c]/35 transition group-hover:text-[#b9825e]/45"
        aria-hidden="true"
      />

      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#eadfd5] ring-1 ring-[#e1d2c5]">
          <Image
            src={testimonial.image}
            alt={`${testimonial.name} portrait`}
            fill
            sizes="64px"
            className="object-cover object-top"
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#1b1511]">
            {testimonial.name}
          </h3>
          <p className="mt-1 text-xs text-[#796b60]">{testimonial.location}</p>
        </div>
      </div>

      <div
        className="mt-4 flex items-center gap-1 text-[#b9825e]"
        aria-label={`${testimonial.rating} out of 5 stars`}
      >
        {Array.from({ length: 5 }, (_, starIndex) => (
          <Star
            key={starIndex}
            className="h-4 w-4"
            fill={starIndex < testimonial.rating ? "currentColor" : "none"}
            aria-hidden="true"
          />
        ))}
      </div>

      <p className="mt-4 flex-1 text-base font-display leading-7 text-[#2b211b]">
        {testimonial.review}
      </p>

      <div className="mt-5 border-t border-[#eadfd4] pt-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a6b4e]">
          {testimonial.purchased}
        </p>
      </div>
    </motion.article>
  );
}
