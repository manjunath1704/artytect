"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Tag } from "lucide-react";

import type { Post } from "@/lib/post-utils";
import { formatPostDate, normalizePostTags } from "@/lib/post-utils";

import SectionHeader from "./section-header";
import ViewMoreLink from "./view-more-link";

type FeaturedPostsSectionProps = {
  posts?: Post[];
};

export default function FeaturedPostsSection({ posts = [] }: FeaturedPostsSectionProps) {
  const latestPosts = posts.slice(0, 3);

  if (!latestPosts.length) return null;

  return (
    <section className="bg-[#fbf8f4] py-20 md:py-28" aria-labelledby="featured-posts-title">
      <div className="site-container">
        <SectionHeader
          id="featured-posts-title"
          eyebrow="Studio journal"
          title="Notes from our clay practice"
          description="Insights on ceramic processes, kiln logs, design inspirations, and notes straight from the studio workbench."
          action={<ViewMoreLink href="/posts">View All Posts</ViewMoreLink>}
        />

        <div className="mt-12 md:mt-14 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <article key={post.id} className="h-full">
              <Link
                href={`/posts/${post.slug}`}
                className="group block h-full overflow-hidden rounded-[32px] bg-[#fbf6f2] shadow-md transition-shadow duration-300 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#efe5d9]">
                  {post.featured_image ? (
                    <Image
                      src={post.featured_image}
                      alt={post.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#8a7765]">
                      Studio Post
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,21,17,0.02),rgba(27,21,17,0.08)_45%,rgba(27,21,17,0.42))] opacity-70 transition group-hover:opacity-90" />
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-white">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ead7c3]">
                      {post.category}
                    </p>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                      {formatPostDate(post.published_at)}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a6b4e]">
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      {normalizePostTags(post.tags)[0] ?? "Studio"}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-display leading-none tracking-normal md:text-xl">
                    {post.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#7d746d]">
                    {post.short_description}
                  </p>
                  <p className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#ded3c8] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1b1511] transition group-hover:border-[#1b1511]">
                    Read article
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
