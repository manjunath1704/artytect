"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type AboutSectionContent = {
  id: number | string;
  eyebrow: string;
  title: string;
  description_primary: string;
  description_secondary: string;
  image_url: string;
  image_alt: string;
  button_label: string;
  button_href: string;
};

type AboutSectionResponse = {
  aboutSection?: AboutSectionContent | null;
};

const fallbackAboutSection: AboutSectionContent = {
  id: "fallback",
  eyebrow: "About the Creator",
  title: "Crafting Timeless Ceramics with Soul",
  description_primary:
    "Rooted in tradition and inspired by contemporary design, each piece is carefully handcrafted to embody simplicity, texture, and emotion. What began as a quiet passion has evolved into a journey of shaping clay into meaningful objects that connect people with art and everyday living.",
  description_secondary:
    "Every creation reflects patience, precision, and a deep respect for materials - celebrating imperfections as a mark of authenticity.",
  image_url: "/images/author.jpg",
  image_alt: "Pottery Artist",
  button_label: "Explore Collection",
  button_href: "/products",
};

export default function AboutSection() {
  const [content, setContent] = useState<AboutSectionContent>(fallbackAboutSection);

  useEffect(() => {
    const fetchAboutSection = async () => {
      try {
        const response = await fetch("/api/about-section", {
          cache: "no-store",
        });
        const result = (await response.json()) as AboutSectionResponse;
        if (result.aboutSection) {
          setContent(result.aboutSection);
        }
      } catch (error) {
        console.error("Unable to load about section.", error);
      }
    };

    void fetchAboutSection();
  }, []);

  return (
    <section id="about" className="w-full bg-[#FFF0EB] py-20 text-neutral-900">
      <div className="site-container grid items-center gap-12 md:grid-cols-2">
        <div className="relative h-[500px] w-full overflow-hidden rounded-[32px] shadow-sm">
          <Image
            src={content.image_url}
            alt={content.image_alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            unoptimized={content.image_url.startsWith("http")}
          />
        </div>

        <div className="flex flex-col gap-6">
          <span className="text-sm tracking-widest uppercase text-neutral-500">
            {content.eyebrow}
          </span>

          <h2 className="text-4xl md:text-5xl font-serif leading-tight">
            {content.title}
          </h2>

          <p className="text-neutral-600 leading-relaxed text-lg">
            {content.description_primary}
          </p>

          <p className="text-neutral-600 leading-relaxed text-lg">
            {content.description_secondary}
          </p>

          <div className="pt-4">
            <Button asChild className="group inline-flex h-12 items-center justify-center gap-3 rounded-full border border-[#1b1511] bg-[#1b1511] px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-[0_16px_32px_rgba(27,21,17,0.12)] transition hover:-translate-y-0.5 hover:bg-transparent hover:text-[#1b1511] sm:px-6">
              <Link href={content.button_href}>
                {content.button_label}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
