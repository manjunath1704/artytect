"use client";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
const BlogHero = () => {
    const { scrollY } = useScroll();

  const y = useTransform(scrollY, [0, 500], [0, 120]);
  return (
    <section className="relative min-h-[calc(60vh-5rem)] overflow-hidden bg-[#201914] text-white">
    <motion.div
style={{ y }}
className="absolute inset-0 scale-110"
>
<Image
src="/images/classes.jpg"
alt="Hands shaping clay in a pottery class"
fill
priority
sizes="100vw"
className="object-cover"
/>
</motion.div>
    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,18,14,0.82),rgba(24,18,14,0.45),rgba(24,18,14,0.18))]" />
    {/* <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#fbf8f4] to-transparent" /> */}

    <div className="site-container relative flex min-h-[calc(100vh-5rem)] items-end pb-12 pt-20 md:pb-16">
      <div className="grid w-full gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
        <div className="max-w-3xl">
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#e9d8c4]">
            Pottery classes
          </p>
          <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:5xl lg:text-6xl">
            Make with clay, leave with ritual
          </h1>
          <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
            Small-format studio sessions for wheel throwing, handbuilding,
            glazing, and the slow confidence that comes from making by hand.
          </p>
        </div>

        <div className="overflow-hidden rounded-[32px] shadow-sm bg-[#17110d]/55 p-5 backdrop-blur-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-display">10</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                Classes
              </p>
            </div>
            <div>
              <p className="text-2xl font-display">12</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                Max seats
              </p>
            </div>
            <div>
              <p className="text-2xl font-display">1-4</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                Weeks
              </p>
            </div>
          </div>
          <Link
            href="#classes"
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3]"
          >
            View classes
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  </section>
  );
};
export default BlogHero;
