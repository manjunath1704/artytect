"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
const BlogHero = () => {
  const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 500], [0, 120]);
  return (
    <section className="relative overflow-hidden border-b border-[#ded2c6] bg-[#201914] text-white">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <Image
          src="/images/deep-b.avif"
          alt="Handmade ceramic pieces in the Studio Haritham journal"
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
              Studio journal
            </p>
            <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:text-5xl lg:text-6xl">
              Notes from the studio
            </h1>
            <p className="mt-7 max-w-2xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
              Stories on ceramic craft, material experiments, studio rituals,
              and the quiet details behind handmade earthware.
            </p>
          </div>

          <div className="hidden overflow-hidden rounded-[10px] bg-[#17110d]/55 p-5 shadow-sm backdrop-blur-md md:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ead7c3]">
              Browse essays
            </p>
            <p className="mt-3 text-sm leading-7 text-[#f4e9dc]">
              Explore process notes, kiln-side observations, and care guides
              from our ceramic practice.
            </p>
            <Link
              href="#stories"
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3]"
            >
              View stories
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
export default BlogHero;
