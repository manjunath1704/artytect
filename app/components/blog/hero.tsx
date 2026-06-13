"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

type HeroData = {
  eyebrow: string;
  title: string;
  description: string;
  background_image_url: string;
  button_label: string;
  button_href: string;
  sidebar_label: string;
  sidebar_description: string;
  sidebar_stat_1_value: string;
  sidebar_stat_1_label: string;
  sidebar_stat_2_value: string;
  sidebar_stat_2_label: string;
  sidebar_stat_3_value: string;
  sidebar_stat_3_label: string;
};

const DEFAULT_HERO: HeroData = {
  eyebrow: "Studio journal",
  title: "Notes from the studio",
  description: "Stories on ceramic craft, material experiments, studio rituals, and the quiet details behind handmade earthware.",
  background_image_url: "/images/deep-b.avif",
  button_label: "View stories",
  button_href: "#stories",
  sidebar_label: "Browse essays",
  sidebar_description: "Explore process notes, kiln-side observations, and care guides from our ceramic practice.",
  sidebar_stat_1_value: "",
  sidebar_stat_1_label: "",
  sidebar_stat_2_value: "",
  sidebar_stat_2_label: "",
  sidebar_stat_3_value: "",
  sidebar_stat_3_label: "",
};

const BlogHero = () => {
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const heroResponse = await fetch("/api/page-heroes?pageKey=blog");
        const heroResult = (await heroResponse.json().catch(() => null)) as
          | { hero?: HeroData }
          | null;
        if (heroResult?.hero) {
          setHero(heroResult.hero);
        }
      } catch {
        // Use defaults
      }
    };
    void fetchHero();
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-[#ded2c6] bg-[#201914] text-white">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image
          src={hero.background_image_url || "/images/deep-b.avif"}
          alt={hero.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,18,14,0.88),rgba(24,18,14,0.58),rgba(24,18,14,0.24))]" />

      <div className="site-container relative flex min-h-[560px] items-end pb-12 pt-28 md:min-h-[640px] md:pb-16 md:pt-32">
        <div className="grid w-full gap-10 lg:grid-cols-[1fr_340px] lg:items-end">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ead7c3]">
              {hero.eyebrow}
            </p>
            <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
              {hero.description}
            </p>
          </div>

          <div className="hidden overflow-hidden rounded-[10px] bg-[#17110d]/55 p-5 shadow-sm backdrop-blur-md md:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ead7c3]">
              {hero.sidebar_label || "Browse essays"}
            </p>
            <p className="mt-3 text-sm leading-7 text-[#f4e9dc]">
              {hero.sidebar_description || "Explore process notes, kiln-side observations, and care guides from our ceramic practice."}
            </p>
            {hero.button_label && (
              <Link
                href={hero.button_href || "#stories"}
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3]"
              >
                {hero.button_label}
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
export default BlogHero;