"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import CategoryCardMicro from "../components/cards/category-card-micro";

type CategoryItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailSrc: string;
  hoverThumbnailSrc: string;
  parentCategoryId: string | null;
  count?: number;
};

const fallbackCategories: CategoryItem[] = [
  {
    id: "bowls",
    title: "Bowls",
    slug: "bowls",
    description: "Everyday forms with soft handles and warm glazes for slow mornings.",
    thumbnailSrc: "/images/bowl-a.avif",
    hoverThumbnailSrc: "/images/bowl-b.avif",
    parentCategoryId: null,
  },
  {
    id: "vases",
    title: "Vases",
    slug: "vases",
    description: "Low, balanced silhouettes that work beautifully for serving and display.",
    thumbnailSrc: "/images/vase-a.avif",
    hoverThumbnailSrc: "/images/vase-b.avif",
    parentCategoryId: null,
  },
  {
    id: "mugs",
    title: "Mugs",
    slug: "mugs",
    description: "Tall statement pieces with clean necks and tactile surface variation.",
    thumbnailSrc: "/images/mug-a.avif",
    hoverThumbnailSrc: "/images/mug-b.avif",
    parentCategoryId: null,
  },
  {
    id: "planters",
    title: "Planters",
    slug: "planters",
    description: "Quiet sculptural accents that bring texture to shelves and tabletops.",
    thumbnailSrc: "/images/planter-a.avif",
    hoverThumbnailSrc: "/images/planter-b.avif",
    parentCategoryId: null,
  },
  {
    id: "plates",
    title: "Plates",
    slug: "plates",
    description: "Simple ceramic plates with warm material character for hosting and layering.",
    thumbnailSrc: "/images/plate-a.avif",
    hoverThumbnailSrc: "/images/plate-b.avif",
    parentCategoryId: null,
  },
  {
    id: "deep-plates",
    title: "Deep plates",
    slug: "deep-plates",
    description: "Deep serving forms with a quiet sculptural profile for soups and grains.",
    thumbnailSrc: "/images/deep-a.avif",
    hoverThumbnailSrc: "/images/deep-b.avif",
    parentCategoryId: null,
  },
  
];

type CategoryRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  hover_thumbnail_url: string;
  parent_category_id: string | null;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>(fallbackCategories);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = (await response.json().catch(() => null)) as
          | { categories?: CategoryRow[] }
          | null;

        if (!isMounted || !response.ok || !result?.categories?.length) {
          setIsLoading(false);
          return;
        }

        const nextCategories = result.categories.map((category: CategoryRow) => ({
          id: category.id,
          title: category.title,
          slug: category.slug,
          description: category.description,
          thumbnailSrc: category.thumbnail_url,
          hoverThumbnailSrc: category.hover_thumbnail_url,
          parentCategoryId: category.parent_category_id,
        }));

        setCategories(nextCategories);
      } catch {
        // Keep fallback
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);
  const parentCategories = categories.filter((category) => !category.parentCategoryId);
  const childrenByParentId = categories.reduce<Map<string, CategoryItem[]>>((groups, category) => {
    if (!category.parentCategoryId) return groups;
    const children = groups.get(category.parentCategoryId) ?? [];
    children.push(category);
    groups.set(category.parentCategoryId, children);
    return groups;
  }, new Map());

  return (
    <>
      <Navbar  />
      <main className="bg-[#f5f0eb] text-[#1b1511]">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#211914] text-white">
                    <motion.div
            style={{ y }}
            className="absolute inset-0 scale-110"
          >
            <Image
              src="/images/gallery/pexels-karola-g-6805523.jpg"
              alt="Hands shaping clay in a pottery class"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,18,14,0.84),rgba(24,18,14,0.5),rgba(24,18,14,0.2))]" />
          <div className="site-container relative flex min-h-[calc(100vh-5rem)] items-end pb-12 pt-20 md:pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="grid w-full gap-10 lg:grid-cols-[1fr_360px] lg:items-end"
            >
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#ead7c3]">
                  
                categories
                </p>
                <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:5xl lg:text-6xl">
                  Explore our ceramic forms
                </h1>
                <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
                  Browse our curated collections of handmade pottery — bowls, vases, mugs,
                  planters, plates, and serving forms shaped with calm lines, tactile
                  finishes, and a studio-made sense of warmth.
                </p>
                <Link
                  href="#collections"
                  className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3]"
                >
                  Browse categories
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="overflow-hidden rounded-[32px] shadow-sm bg-[#17110d]/55 p-5 backdrop-blur-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-display">{categories.length}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                    categories
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display">100+</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Pieces
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display">WA</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Order
                    </p>
                  </div>
                </div>
                <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-6 text-[#ead7c3]">
                  Explore each collection to discover handcrafted pieces for your
                  daily rituals and living spaces.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Categories — Alternating Split Sections ──────────────── */}
        <div id="collections" className="site-container py-20 md:py-28 rounded-[32px] hidden md:block">
          {isLoading ? (
            /* Loading skeleton */
            <div className="divide-y divide-[#d9cfc6]">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid md:grid-cols-2">
                  <div className="aspect-[4/3] animate-pulse bg-[#e4d9d0] md:aspect-auto md:min-h-[600px]" />
                  <div className="flex items-center px-6 py-16 sm:px-8 md:px-12 lg:px-16">
                    <div className="w-full max-w-lg animate-pulse">
                      <div className="h-4 w-24 bg-[#e4d9d0]" />
                      <div className="mt-6 h-16 w-48 bg-[#e4d9d0]" />
                      <div className="mt-8 h-3 w-full bg-[#e4d9d0]" />
                      <div className="mt-2 h-3 w-3/4 bg-[#e4d9d0]" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              {parentCategories.map((category, index) => {
                const isEven = index % 2 === 0;
                const children = childrenByParentId.get(category.id) ?? [];

                return (
                  <motion.section
                    key={category.slug}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="group rounded-[32px] shadow-sm overflow-hidden"
                  >
                    <Link
                      href={`/categories/${category.slug}`}
                      className="grid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#1b1511] md:grid-cols-2"
                    >
                      {/* Image — left on even, right on odd */}
                      <div
                        className={[
                          "relative aspect-[4/3] overflow-hidden rounded-[32px] bg-[#e4d9d0]",
                          "md:aspect-auto md:min-h-[600px] md:rounded-none",
                          isEven ? "md:order-1" : "md:order-2",
                        ].join(" ")}
                      >
                        <Image
                          src={category.hoverThumbnailSrc}
                          alt={category.title}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-[opacity,transform] duration-[1200ms] ease-out group-hover:scale-105 group-hover:opacity-0"
                        />
                        <Image
                          src={category.thumbnailSrc}
                          alt={`${category.title} alternate view`}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover opacity-0 transition-[opacity,transform] duration-[1200ms] ease-out group-hover:scale-105 group-hover:opacity-100"
                        />

                        {/* Subtle overlay on hover */}
                        <div className="absolute inset-0 bg-[#1b1511] opacity-0 transition-opacity duration-700 group-hover:opacity-5" />

                        {/* Index number — bottom left */}
                       
                      </div>

                      {/* Content — right on even, left on odd */}
                      <div
                        className={[
                          "flex items-center rounded-[32px] bg-[#faf6f2] px-6 py-16 sm:px-8 md:rounded-none md:px-12 lg:px-16",
                          isEven ? "md:order-2" : "md:order-1",
                        ].join(" ")}
                      >
                        <div className="w-full max-w-lg">
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#9a6b4e]">
                            categories
                            </p>

                            <h2 className="mt-6 font-display text-[clamp(3rem,6vw,3rem)] uppercase leading-[0.95] tracking-[-0.03em] text-[#1b1511]">
                              {category.title}
                            </h2>

                            <div className="mt-8 h-px w-12 bg-[#c4b5a8]" />

                            <p className="mt-8 text-base leading-8 text-[#6b5f55]">
                              {category.description}
                            </p>

                            {children.length > 0 && (
                              <div className="mt-7 flex flex-wrap gap-2">
                                {children.map((child) => (
                                  <span
                                    key={child.id}
                                    className="rounded-full border border-[#d9cfc6] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#5f544b]"
                                  >
                                    {child.title}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Explore link */}
                            <div className="mt-10 inline-flex items-center gap-3 border-b border-[#1b1511] pb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1b1511] transition-opacity duration-300 group-hover:opacity-60">
                              <span>Explore categories</span>
                              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </Link>
                  </motion.section>
                );
              })}
            </div>
          )}
           
        </div>

       <div className="site-container grid gap-3 grid-cols-2 py-10 md:hidden">
       {
            parentCategories.map((category, index) => (
              <div key={category.id}>
                <CategoryCardMicro
                    title={category.title}
                    description={category.description}
                    href={"/categories/" + category.slug}
                    index={index + 1}
                    thumbnailSrc={category.hoverThumbnailSrc}
                    hoverThumbnailSrc={category.thumbnailSrc}
                  />
              </div>
            ))
           }
       </div>
      </main>
      <Footer />
    </>
  );
}
