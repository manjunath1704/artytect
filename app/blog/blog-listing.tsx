"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Search, Tag, X } from "lucide-react";

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
  const currentPage = Math.min(page, totalPages);
  const visibleBlogs = filteredBlogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const hasActiveFilters = query.trim() || category !== "all" || sort !== "latest";

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("latest");
    setPage(1);
  };

  return (
    <main className="bg-[#fbf8f4] text-[#1b1511]">
      <section id="stories" className="site-container py-16 md:py-24">
        <div className="mb-10 grid gap-6 border-b border-[#d8cabd] pb-8 md:grid-cols-[0.8fr_1fr] md:items-end">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9a6b4e]">
              Read the journal
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-display uppercase leading-none tracking-normal text-[#1b1511] sm:text-5xl">
              Stories in clay
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-[#665b4f] md:justify-self-end">
            Filter studio notes by topic, search for materials or techniques,
            and keep exploring without leaving the public site rhythm.
          </p>
        </div>

        <div className="mb-10 border-b border-[#d8cabd] pb-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_210px_190px_auto] lg:items-end">
            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a817a]">
                Search
              </span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9a8d82]" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, tag, or author"
                  className="h-12 rounded-[10px] border border-[#d9ccbc] bg-[#fffdf9] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#a59b93] focus-visible:border-[#1b1511] focus-visible:ring-0"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a817a]">
                Category
              </span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 w-full rounded-[10px] border border-[#d9ccbc] bg-[#fffdf9] px-4 text-sm outline-none transition focus:border-[#1b1511]"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item === "all" ? "All categories" : item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8a817a]">
                Sort
              </span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as "latest" | "oldest")}
                className="h-12 w-full rounded-[10px] border border-[#d9ccbc] bg-[#fffdf9] px-4 text-sm outline-none transition focus:border-[#1b1511]"
              >
                <option value="latest">Latest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#d9ccbc] bg-[#fffdf9] px-4 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:border-[#1b1511] hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7765]">
          <p>
            Showing {visibleBlogs.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-
            {Math.min(currentPage * PAGE_SIZE, filteredBlogs.length)} of {filteredBlogs.length}
          </p>
          <p>{category === "all" ? "All categories" : category}</p>
        </div>

        <div className="min-h-[720px]">
          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-[10px] bg-[#fffdf9] p-4 shadow-sm">
                  <Skeleton className="aspect-[4/3] rounded-[10px] bg-[#eee3d6]" />
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
                        className="group block h-full overflow-hidden rounded-[32px] bg-[#fffdf9] shadow-sm transition-shadow duration-300 hover:shadow-md"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-[#efe5d9]">
                          {blog.featured_image ? (
                            <Image
                              src={blog.featured_image}
                              alt={blog.title}
                              fill
                              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm text-[#8a7765]">
                              Studio Journal
                            </div>
                          )}
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,21,17,0.02),rgba(27,21,17,0.08)_45%,rgba(27,21,17,0.42))] opacity-70 transition group-hover:opacity-90" />
                          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 text-white">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ead7c3]">
                              {blog.category}
                            </p>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                              {formatBlogDate(blog.published_at)}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a6b4e]">
                            <span className="inline-flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5" />
                              {normalizeBlogTags(blog.tags)[0] ?? "Studio"}
                            </span>
                          </div>
                          <h3 className="mt-3 text-xl font-display uppercase leading-none tracking-normal md:text-2xl">
                            {blog.title}
                          </h3>
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#7d746d]">
                            {blog.short_description}
                          </p>
                          <p className="mt-4 inline-flex h-10 items-center gap-2 rounded-full border border-[#ded3c8] bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1b1511] transition group-hover:border-[#1b1511]">
                            Read article
                            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </p>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </motion.div>

              {totalPages > 1 && (
                <div className="mt-10">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-[10px] border border-dashed border-[#d9ccbc] bg-[#fcfaf7] px-6 py-16 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#8a7765]">
                No stories found
              </p>
              <h2 className="mt-3 text-3xl tracking-[-0.03em]">The shelf is quiet for now.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#665b4f]">
                Try a different search, category, or sort order.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
