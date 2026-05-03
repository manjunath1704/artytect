"use client";

import { Button } from "@/components/ui/button";

export default function AboutSection() {
  return (
    <section className="w-full bg-[#FFF0EB] text-neutral-900 py-20 px-6 md:px-16">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        
        {/* LEFT - IMAGE */}
        <div className="w-full h-[500px] overflow-hidden">
          <img
            src="/images/author.jpg" // replace with your image
            alt="Pottery Artist"
            className="w-full h-full object-cover"
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
            <Button className="bg-black text-white hover:bg-neutral-800 px-8 py-6 text-sm tracking-wide uppercase rounded-none">
              Explore Collection
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}