import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { formatBlogDate, getPublishedBlogBySlug } from "@/lib/blogs";
import { normalizeBlogTags } from "@/lib/blog-utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) {
    return {
      title: "Blog not found | Studio Haritham",
    };
  }

  return {
    title: blog.meta_title || `${blog.title} | Studio Haritham`,
    description: blog.meta_description || blog.short_description,
    openGraph: {
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.short_description,
      type: "article",
      publishedTime: blog.published_at ?? blog.created_at,
      authors: [blog.author],
      images: blog.featured_image ? [{ url: blog.featured_image, alt: blog.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.short_description,
      images: blog.featured_image ? [blog.featured_image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) notFound();
  const tags = normalizeBlogTags(blog.tags);

  return (
    <>
      <Navbar forceSolid />
      <main className="bg-[#fbf8f3] text-[#1b1511]">
        <article className="site-container pb-20 pt-32 sm:pt-36">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#8a7765] transition hover:text-[#1b1511]"
          >
            <ArrowLeft className="h-4 w-4" />
            Blog
          </Link>

          <header className="mt-8 max-w-4xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#8a7765]">
              {blog.category} / {blog.slug}
            </p>
            <h1 className="mt-4 text-5xl tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              {blog.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#665b4f]">
              {blog.short_description}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-[#665b4f]">
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                {blog.author}
              </span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatBlogDate(blog.published_at)}
              </span>
            </div>
          </header>

          <div className="mt-10 overflow-hidden rounded-[8px] bg-[#efe5d9]">
            {blog.featured_image ? (
              <div className="relative aspect-[16/9]">
                <Image
                  src={blog.featured_image}
                  alt={blog.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-[16/9] items-center justify-center text-[#8a7765]">
                Studio Haritham Journal
              </div>
            )}
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,760px)_260px] lg:items-start">
            <div
              className="blog-content rounded-[8px] bg-white p-6 text-[#2a211a] shadow-sm sm:p-8"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            <aside className="rounded-[8px] border border-[#e8ddd1] bg-white p-5 lg:sticky lg:top-28">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8a7765]">
                Tags
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.length ? (
                  tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-[#f5eee4] px-3 py-1.5 text-xs font-medium text-[#1b1511]"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[#665b4f]">No tags added.</span>
                )}
              </div>
            </aside>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
