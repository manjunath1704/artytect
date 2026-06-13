"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductCatalog from "./product-catalog";
import { motion, useScroll, useTransform } from "framer-motion";

type ProductsPageContentProps = {
  products: Product[];
};

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
  eyebrow: "Shop ceramics",
  title: "Objects for quiet daily living",
  description: "Bowls, plates, mugs, planters, and vessels shaped with calm lines, tactile finishes, and a studio-made sense of warmth.",
  background_image_url: "/images/gallery/pexels-readymade-3847457.jpg",
  button_label: "Browse catalog",
  button_href: "#catalog",
  sidebar_label: "Pieces",
  sidebar_description: "Choose a piece, tap Order Now, and send the product details directly through WhatsApp.",
  sidebar_stat_1_value: "",
  sidebar_stat_1_label: "Pieces",
  sidebar_stat_2_value: "",
  sidebar_stat_2_label: "Forms",
  sidebar_stat_3_value: "WA",
  sidebar_stat_3_label: "Order",
};

export default function ProductsPageContent({ products }: ProductsPageContentProps) {
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const heroResponse = await fetch("/api/page-heroes?pageKey=products");
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
      <main className="bg-white text-[#171717]">
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#211914] text-white">
          <motion.div
            style={{ y }}
            className="absolute inset-0 scale-110"
          >
            <Image
              src={hero.background_image_url || "/images/gallery/pexels-readymade-3847457.jpg"}
              alt={hero.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,18,14,0.84),rgba(24,18,14,0.5),rgba(24,18,14,0.2))]" />

          <div className="site-container relative flex min-h-[calc(100vh-5rem)] items-end pb-12 pt-20 md:pb-16">
            <div className="grid w-full gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#ead7c3]">
                  {hero.eyebrow}
                </p>
                <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:5xl lg:text-6xl">
                  {hero.title}
                </h1>
                <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
                  {hero.description}
                </p>
                {hero.button_label && (
                  <Link
                    href={hero.button_href || "#catalog"}
                    className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3]"
                  >
                    {hero.button_label}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="overflow-hidden rounded-[32px] shadow-sm bg-[#17110d]/55 p-5 backdrop-blur-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-display">{hero.sidebar_stat_1_value || products.length}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      {hero.sidebar_stat_1_label || "Pieces"}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display">{hero.sidebar_stat_2_value || new Set(products.map((product) => product.category)).size}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      {hero.sidebar_stat_2_label || "Forms"}
                    </p>
                  </div>
                  {/* <div>
                    <p className="text-2xl font-display">{hero.sidebar_stat_3_value || "WA"}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      {hero.sidebar_stat_3_label || "Order"}
                    </p>
                  </div> */}
                </div>
                <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-6 text-[#ead7c3]">
                  {hero.sidebar_description || "Choose a piece, tap Order Now, and send the product details directly through WhatsApp."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div id="catalog">
          <ProductCatalog products={products} />
        </div>
      </main>
  );
}