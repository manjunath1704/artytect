"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import ClassCard from "@/app/components/cards/class-card";
import ClassCardMicro from "../components/cards/class-card-micro";
import type { PotteryClass } from "@/lib/classes";

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
  eyebrow: "Pottery classes",
  title: "Make with clay, leave with ritual",
  description: "Small-format studio sessions for wheel throwing, handbuilding, glazing, and the slow confidence that comes from making by hand.",
  background_image_url: "/images/classes.jpg",
  button_label: "",
  button_href: "",
  sidebar_label: "Classes",
  sidebar_description: "",
  sidebar_stat_1_value: "",
  sidebar_stat_1_label: "Classes",
  sidebar_stat_2_value: "12",
  sidebar_stat_2_label: "Max seats",
  sidebar_stat_3_value: "1-4",
  sidebar_stat_3_label: "Weeks",
};

export default function ClassesPageContent() {
  const [classes, setClasses] = useState<PotteryClass[]>([]);
  const [hero, setHero] = useState<HeroData>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Load hero data
        const heroResponse = await fetch("/api/page-heroes?pageKey=classes");
        const heroResult = (await heroResponse.json().catch(() => null)) as
          | { hero?: HeroData }
          | null;
        if (heroResult?.hero) {
          setHero(heroResult.hero);
        }
      } catch {
        // Use defaults
      }

      try {
        const response = await fetch("/api/classes");
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || []);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchClasses();
  }, []);

  return (
      <main className="pt-20 md:pt-0 bg-[#fbf8f4] text-[#171717]">
        <section className="hidden md:block relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#201914] text-white">
          <motion.div
  style={{ y }}
  className="absolute inset-0 scale-110"
>
  <Image
    src={hero.background_image_url || "/images/classes.jpg"}
    alt={hero.title}
    fill
    priority
    sizes="100vw"
    className="object-cover"
  />
</motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,18,14,0.82),rgba(24,18,14,0.45),rgba(24,18,14,0.18))]" />

          <div className="site-container relative flex min-h-[calc(100vh-5rem)] items-end pb-12 pt-20 md:pb-16">
            <div className="grid w-full gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#e9d8c4]">
                  {hero.eyebrow}
                </p>
                <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:5xl lg:text-6xl">
                  {hero.title}
                </h1>
                <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
                  {hero.description}
                </p>
              </div>

              <div className="overflow-hidden rounded-[32px] shadow-sm bg-[#17110d]/55 p-5 backdrop-blur-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-display">{hero.sidebar_stat_1_value || classes.length}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      {hero.sidebar_stat_1_label || "Classes"}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display">{hero.sidebar_stat_2_value || "12"}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      {hero.sidebar_stat_2_label || "Max seats"}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display">{hero.sidebar_stat_3_value || "1-4"}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      {hero.sidebar_stat_3_label || "Weeks"}
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

        <section id="classes" className="py-10 md:py-20">
          <div className="site-container">
            <div className=" grid gap-6 border-b border-[#d7cabd] pb-7 md:grid-cols-[0.8fr_1fr] md:items-end">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">
                  Studio calendar
                </p>
                <h2 className="mt-3 text-4xl font-display uppercase leading-none tracking-normal md:text-5xl">
                  Choose your table
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-7 text-[#6f6259] md:justify-self-end">
                Each class is capped for close instruction, enough room to make
                mistakes, and plenty of time to understand the material.
              </p>
            </div>

            {loading ? (
              <div className="mt-10 flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#9a6b4e]" />
              </div>
            ) : classes.length > 0 ? (
              <>
                <div className="hidden md:block mt-10">
                  <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3 ">
                    {classes.map((classItem) => (
                      <ClassCard
                        key={classItem.id}
                        classItem={classItem}
                      />
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 grid-cols-2 py-10 md:hidden">
                  {classes.map((classItem) => (
                    <ClassCardMicro
                      key={classItem.id}
                      classItem={classItem}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-10 rounded-2xl border border-[#d9ccbc] bg-[#faf6f2] p-12 text-center">
                <p className="text-sm text-[#6b5f55]">
                  No classes available at the moment. Check back soon!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
  );
}