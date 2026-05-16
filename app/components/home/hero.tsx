"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Variants } from "framer-motion";

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.18,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: "easeOut" },
  },
};

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["-6%", "14%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.78], [1, 0.72]);

  return (
    <section
      ref={heroRef}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#17110d] py-24 text-[#fff8ef] md:py-28"
    >
      <motion.video
        className="absolute inset-0 h-[118%] w-full object-cover object-center"
        style={{
          y: prefersReducedMotion ? 0 : videoY,
          scale: prefersReducedMotion ? 1 : 1.06,
        }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/gallery/pexels-rdne-8903259.jpg"
        aria-hidden="true"
      >
        <source src="/videos/hero-a-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
        <source src="/videos/hero.mp4" type="video/mp4" />
      </motion.video>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,12,8,0.66),rgba(32,22,15,0.34)_48%,rgba(18,12,8,0.10))]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,10,7,0.22),rgba(154,92,54,0.10)_48%,rgba(15,10,7,0.36))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,rgba(10,7,5,0.34)_100%)]" />
      <div className="absolute inset-0 opacity-[0.06] mix-blend-soft-light [background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.2)_0px,rgba(255,255,255,0.2)_1px,transparent_1px,transparent_5px)]" />
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#17110d]/82 to-transparent" />

      <motion.div
        className="site-container relative z-10 will-change-transform"
        style={{
          y: prefersReducedMotion ? 0 : contentY,
          opacity: prefersReducedMotion ? 1 : contentOpacity,
        }}
      >
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="flex  flex-col items-center gap-4"
        >
          <motion.h1
            variants={itemVariants}
            className="uppercase  text-6xl md:text-8xl font-display leading-[1.08] tracking-normal text-[#ffffff] sm:leading-[1.04] text-center"
          >
         Slow living, <br />sculpted.
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className=" font-semibold text-[clamp(1rem,2.6vw,1.25rem)] leading-8 text-[#ffffff]"
          >
           Earthy pottery shaped for everyday rituals.
          </motion.p>

          <motion.div
            variants={itemVariants}
            
          >
            <Button
              size="lg"
              className="group h-14 rounded-full border border-[#f8f2e8]/20 bg-[#ffffff] px-7 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#17140f] shadow-[0_18px_48px_rgba(248,242,232,0.18)] transition hover:-translate-y-0.5 hover:bg-[#efe4d6] sm:px-8"
              asChild
            >
              <Link href="/products">
                Shop now
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </Button>
           
          </motion.div>

        </motion.div>
      </motion.div>

      <motion.a
        href="#collections"
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[#f8e6d0]"
        aria-label="Scroll to collections"
        animate={prefersReducedMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="h-10 w-6 rounded-full border border-white/35 p-1">
          <span className="mx-auto block h-1.5 w-1.5 rounded-full bg-current" />
        </span>
        <ChevronDown className="h-4 w-4" />
      </motion.a>
    </section>
  );
};

export default Hero;
