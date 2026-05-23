"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Search, Tag } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Blog, formatBlogDate, normalizeBlogTags } from "@/lib/blog-utils";

type BlogListingProps = {
  blogs: Blog[];
};

const PAGE_SIZE = 6;

export default function BlogListing({ blogs }: BlogListingProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"latest" | "oldest">("latest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(blogs.map((blog) => blog.category))).sort()],
    [blogs],
  );

  useEffect(() => {
    setPage(1);
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 280);
    return () => window.clearTimeout(timer);
  }, [query, category, sort]);

  const filteredBlogs = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return blogs
      .filter((blog) => {
        const matchesQuery =
          !needle ||
          [blog.title, blog.slug, blog.short_description, blog.category, blog.author, normalizeBlogTags(blog.tags).join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(needle);
        const matchesCategory = category === "all" || blog.category === category;
        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        const left = new Date(a.published_at ?? a.created_at).getTime();
        const right = new Date(b.published_at ?? b.created_at).getTime();
        return sort === "latest" ? right - left : left - right;
      });
  }, [blogs, category, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const visibleBlogs = filteredBlogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="bg-[#fbf8f3] text-[#1b1511]">
      <section className="site-container pb-10 pt-32 sm:pt-36">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
          Journal
        </p>
        <div className="mt-4 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <h1 className="text-5xl tracking-[-0.04em] sm:text-6xl">
            Notes from the studio
          </h1>
          <p className="max-w-2xl text-base leading-8 text-[#665b4f] lg:justify-self-end">
            Stories on ceramic craft, material experiments, studio rituals, and the quiet details behind handmade earthware.
          </p>
        </div>
      </section>

      <section className="site-container pb-16">
        <div className="mb-8 grid gap-4 rounded-[8px] border border-[#e8ddd1] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_180px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7765]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search blogs"
              className="h-12 rounded-[8px] border-[#d9ccbc] bg-[#fcfaf7] pl-11 text-[#1b1511] focus-visible:ring-[#d7b68b]/30"
            />
          </label>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 rounded-[8px] border border-[#d9ccbc] bg-[#fcfaf7] px-4 text-sm text-[#1b1511] outline-none transition focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item === "all" ? "All categories" : item}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as "latest" | "oldest")}
            className="h-12 rounded-[8px] border border-[#d9ccbc] bg-[#fcfaf7] px-4 text-sm text-[#1b1511] outline-none transition focus:border-[#b38d67] focus:ring-4 focus:ring-[#d7b68b]/20"
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-[8px] border border-[#e8ddd1] bg-white p-4">
                <Skeleton className="aspect-[4/3] rounded-[8px] bg-[#eee3d6]" />
                <Skeleton className="mt-5 h-5 w-3/4 bg-[#eee3d6]" />
                <Skeleton className="mt-3 h-4 w-full bg-[#eee3d6]" />
                <Skeleton className="mt-2 h-4 w-2/3 bg-[#eee3d6]" />
              </div>
            ))}
          </div>
        ) : visibleBlogs.length ? (
          <>
            <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {visibleBlogs.map((blog) => (
                  <motion.article
                    key={blog.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Link
                      href={`/blog/${blog.slug}`}
                      className="group block h-full overflow-hidden rounded-[8px] border border-[#e8ddd1] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(27,21,17,0.14)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#efe5d9]">
                        {blog.featured_image ? (
                          <Image
                            src={blog.featured_image}
                            alt={blog.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-[#8a7765]">
                            Studio Journal
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-[#8a7765]">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatBlogDate(blog.published_at)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5" />
                            {blog.category}
                          </span>
                        </div>
                        <h2 className="mt-3 text-2xl leading-tight tracking-[-0.03em]">
                          {blog.title}
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-[#665b4f]">
                          {blog.short_description}
                        </p>
                        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#1b1511]">
                          Read article
                        </p>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[8px] border border-dashed border-[#d7b68b] bg-white px-6 py-16 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a7765]">
              No stories found
            </p>
            <h2 className="mt-3 text-3xl tracking-[-0.03em]">The shelf is quiet for now.</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#665b4f]">
              Try a different search, category, or sort order.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
