"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Award,
  Palette,
  Leaf,
  Heart,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

type HeroData = {
  title: string;
  subtitle: string;
  hero_image_url: string;
  hero_image_alt: string;
};

type ContentData = {
  who_we_are_title: string;
  who_we_are_content: string;
  who_we_are_image_url: string | null;
  journey_title: string;
  journey_content: string;
  journey_image_url: string | null;
  mission_title: string;
  mission_content: string;
  vision_title: string;
  vision_content: string;
};

type ValueData = {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  sort_order: number;
};

type TimelineData = {
  id: string;
  year: string;
  title: string;
  description: string;
  image_url: string | null;
  sort_order: number;
};

type TeamData = {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
  sort_order: number;
};

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  award: Award,
  palette: Palette,
  leaf: Leaf,
  heart: Heart,
  sparkles: Sparkles,
};

const fallbackHero: HeroData = {
  title: "Our Story",
  subtitle: "Crafting meaningful ceramics with tradition, soul, and purpose",
  hero_image_url: "/images/gallery/pexels-karola-g-6805523.jpg",
  hero_image_alt: "Our Story Hero Image",
};

const fallbackContent: ContentData = {
  who_we_are_title: "Who We Are",
  who_we_are_content:
    "We are a pottery studio dedicated to creating handmade ceramic pieces that bring warmth and beauty to everyday life.",
  who_we_are_image_url: "/images/author.jpg",
  journey_title: "Our Journey",
  journey_content:
    "What started as a passion project in a small studio has grown into a thriving ceramic brand loved by collectors worldwide.",
  journey_image_url: "/images/gallery/pexels-rdne-8903259.jpg",
  mission_title: "Our Mission",
  mission_content:
    "To craft timeless ceramic pieces that inspire mindful living and connect people with the beauty of handmade artistry.",
  vision_title: "Our Vision",
  vision_content:
    "To become a leading name in sustainable, handcrafted ceramics while preserving traditional pottery techniques.",
};

export default function OurStoryPageContent() {
  const [hero, setHero] = useState<HeroData>(fallbackHero);
  const [content, setContent] = useState<ContentData>(fallbackContent);
  const [values, setValues] = useState<ValueData[]>([]);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [team, setTeam] = useState<TeamData[]>([]);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 120]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, contentRes, valuesRes, timelineRes, teamRes] = await Promise.all([
          fetch("/api/our-story/hero"),
          fetch("/api/our-story/content"),
          fetch("/api/our-story/values"),
          fetch("/api/our-story/timeline"),
          fetch("/api/our-story/team"),
        ]);

        if (heroRes.ok) {
          const data = await heroRes.json();
          if (data.hero) setHero(data.hero);
        }

        if (contentRes.ok) {
          const data = await contentRes.json();
          if (data.content) setContent(data.content);
        }

        if (valuesRes.ok) {
          const data = await valuesRes.json();
          if (data.values) setValues(data.values);
        }

        if (timelineRes.ok) {
          const data = await timelineRes.json();
          if (data.timeline) setTimeline(data.timeline);
        }

        if (teamRes.ok) {
          const data = await teamRes.json();
          if (data.team) setTeam(data.team);
        }
      } catch (error) {
        console.error("Error fetching our story data:", error);
      }
    };

    void fetchData();
  }, []);

  return (
    <main className="bg-[#f5f0eb] text-[#1b1511]">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#211914] text-white">
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <Image
            src={hero.hero_image_url}
            alt={hero.hero_image_alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,18,14,0.84),rgba(24,18,14,0.5),rgba(24,18,14,0.2))]" />
        
        <div className="site-container relative flex min-h-[calc(100vh-5rem)] items-center pb-12 pt-20 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#ead7c3]">
              <Sparkles className="h-4 w-4" />
              About Us
            </p>
            <h1 className="mt-5 font-display text-4xl uppercase leading-[1] tracking-normal sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
              {hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 md:py-28">
        <div className="site-container">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {content.who_we_are_image_url && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-[#e4d9d0] shadow-sm"
              >
                <Image
                  src={content.who_we_are_image_url}
                  alt={content.who_we_are_title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </motion.div>
            )}
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#9a6b4e]">
                Introduction
              </p>
              <h2 className="mt-4 font-display text-4xl uppercase leading-tight tracking-[-0.02em] md:text-5xl">
                {content.who_we_are_title}
              </h2>
              <p className="mt-6 text-base leading-8 text-[#6b5f55]">
                {content.who_we_are_content}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      {content.journey_content && (
        <section className="bg-[#faf6f2] py-20 md:py-28">
          <div className="site-container">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="order-2 lg:order-1"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#9a6b4e]">
                  How It Started
                </p>
                <h2 className="mt-4 font-display text-4xl uppercase leading-tight tracking-[-0.02em] md:text-5xl">
                  {content.journey_title}
                </h2>
                <p className="mt-6 text-base leading-8 text-[#6b5f55]">
                  {content.journey_content}
                </p>
              </motion.div>

              {content.journey_image_url && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="order-1 lg:order-2"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-[32px] bg-[#e4d9d0] shadow-sm">
                    <Image
                      src={content.journey_image_url}
                      alt={content.journey_title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Mission & Vision Section */}
      <section className="py-20 md:py-28">
        <div className="site-container">
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-[32px] bg-white p-8 shadow-sm md:p-10"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#9a6b4e]">
                Purpose
              </p>
              <h3 className="mt-4 font-display text-3xl uppercase leading-tight">
                {content.mission_title}
              </h3>
              <p className="mt-6 leading-7 text-[#6b5f55]">
                {content.mission_content}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-[32px] bg-white p-8 shadow-sm md:p-10"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#9a6b4e]">
                Future
              </p>
              <h3 className="mt-4 font-display text-3xl uppercase leading-tight">
                {content.vision_title}
              </h3>
              <p className="mt-6 leading-7 text-[#6b5f55]">
                {content.vision_content}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      {values.length > 0 && (
        <section className="bg-[#fbf8f4] py-20 md:py-28">
          <div className="site-container">
            <div className="mb-12 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#9a6b4e]">
                What Drives Us
              </p>
              <h2 className="mt-3 font-display text-4xl uppercase leading-none tracking-normal sm:text-5xl">
                Our Values
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
                const Icon = iconMap[value.icon_name] || Award;
                return (
                  <motion.div
                    key={value.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="rounded-[32px]  bg-white p-6 shadow-sm transition  shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f0eb]">
                      <Icon className="h-6 w-6 text-[#9a6b4e]" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#6b5f55]">
                      {value.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {timeline.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="site-container">
            <div className="mb-16 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#9a6b4e]">
                Journey
              </p>
              <h2 className="mt-3 font-display text-4xl uppercase leading-none tracking-normal sm:text-5xl">
                Our Timeline
              </h2>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 hidden h-full w-0.5 bg-[#d9cfc6] md:block lg:left-1/2" />

              <div className="space-y-12">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className={`relative grid gap-6 md:gap-8 lg:grid-cols-2 ${
                      index % 2 === 0 ? "" : "lg:grid-flow-dense"
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-[30px] top-6 hidden h-4 w-4 rounded-full border-4 border-[#f5f0eb] bg-[#9a6b4e] md:block lg:left-1/2 lg:-translate-x-1/2" />

                    {/* Content */}
                    <div
                      className={`rounded-[32px] border border-[#d9cfc6] bg-white p-6 shadow-sm md:p-8 ${
                        index % 2 === 0 ? "lg:text-right" : "lg:col-start-2"
                      }`}
                    >
                      <span className="inline-block rounded-full bg-[#f5f0eb] px-4 py-2 text-sm font-semibold text-[#9a6b4e]">
                        {item.year}
                      </span>
                      <h3 className="mt-4 text-2xl font-semibold">
                        {item.title}
                      </h3>
                      <p className="mt-3 leading-7 text-[#6b5f55]">
                        {item.description}
                      </p>
                    </div>

                    {/* Image (if exists) */}
                    {item.image_url && (
                      <div
                        className={`relative aspect-[16/10] overflow-hidden rounded-[32px] bg-[#e4d9d0] shadow-sm ${
                          index % 2 === 0 ? "" : "lg:col-start-1 lg:row-start-1"
                        }`}
                      >
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          sizes="(min-width: 1024px) 50vw, 100vw"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Team Section */}
      {team.length > 0 && (
        <section className="bg-[#faf6f2] py-20 md:py-28">
          <div className="site-container">
            <div className="mb-12 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.36em] text-[#9a6b4e]">
                Meet The Team
              </p>
              <h2 className="mt-3 font-display text-4xl uppercase leading-none tracking-normal sm:text-5xl">
                Behind The Craft
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="overflow-hidden rounded-[32px] bg-white shadow-sm"
                >
                  {member.image_url && (
                    <div className="relative aspect-square">
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="mt-1 text-sm font-medium text-[#9a6b4e]">
                      {member.role}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-[#6b5f55]">
                      {member.bio}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="site-container">
          <div className="relative overflow-hidden rounded-[32px] bg-[#211914] px-8 py-16 text-center text-white shadow-xl md:px-12 md:py-20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,215,195,0.3)_0%,transparent_70%)]" />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <h2 className="font-display text-3xl uppercase leading-tight tracking-normal md:text-4xl lg:text-5xl">
                Ready to bring home handcrafted ceramics?
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#f4e9dc] md:text-base">
                Explore our curated collection of pottery pieces, each crafted with care and ready to enhance your everyday rituals.
              </p>
              <Link
                href="/products"
                className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3] sm:px-8"
              >
                Explore Collection
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
