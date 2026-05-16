"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

export default function AboutSection() {
  return (
    <section id="about" className="w-full bg-[#FFF0EB] py-20 text-neutral-900">
      <div className="site-container grid items-center gap-12 md:grid-cols-2">
        
        {/* LEFT - IMAGE */}
        <div className="relative h-[500px] w-full overflow-hidden rounded-[32px] shadow-sm">
          <Image
            src="/images/author.jpg" // replace with your image
            alt="Pottery Artist"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        {/* RIGHT - CONTENT */}
        <div className="flex flex-col gap-6">
          <span className="text-sm tracking-widest uppercase text-neutral-500">
            About the Creator
          </span>

          <h2 className="text-4xl md:text-5xl font-serif leading-tight">
            Crafting Timeless Ceramics with Soul
          </h2>

          <p className="text-neutral-600 leading-relaxed text-lg">
            Rooted in tradition and inspired by contemporary design, each piece
            is carefully handcrafted to embody simplicity, texture, and emotion.
            What began as a quiet passion has evolved into a journey of shaping
            clay into meaningful objects that connect people with art and
            everyday living.
          </p>

          <p className="text-neutral-600 leading-relaxed text-lg">
            Every creation reflects patience, precision, and a deep respect for
            materials — celebrating imperfections as a mark of authenticity.
          </p>

          <div className="pt-4">
            <Button className="group inline-flex h-12 items-center justify-center gap-3 rounded-full border border-[#1b1511] bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.12)] transition hover:-translate-y-0.5 hover:bg-transparent hover:text-[#1b1511] sm:px-6">
              Explore Collection
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
