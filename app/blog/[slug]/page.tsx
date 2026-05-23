import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarDays, Tag, UserRound } from "lucide-react";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { formatBlogDate, getPublishedBlogBySlug, getPublishedBlogs } from "@/lib/blogs";
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
  const relatedBlogs = (await getPublishedBlogs())
    .filter((item) => item.id !== blog.id)
    .filter((item) => item.category === blog.category || normalizeBlogTags(item.tags).some((tag) => tags.includes(tag)))
    .slice(0, 3);

  return (
    <div className="bg-[#fbf8f4]">
      <Navbar forceSolid />
      <main className=" text-[#1b1511]">
        <article className="mt-[130px]">
        <div className="site-container">
        <h1 className=" text-xl font-display leading-[1] tracking-normal sm:text-2xl lg:text-5xl mb-4">
                  {blog.title}
                </h1>
                <div className="h-[80vh] relative rounded-[32px] overflow-hidden">
                {blog.featured_image ? (
                <Image
                  src={blog.featured_image}
                  alt={blog.title}
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />) : <div className="h-full bg-[#2a211a]" /> }
                </div>
        </div>

          <section className="py-12 md:py-16 lg:py-20">
            <div className="site-container">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,780px)_320px] lg:items-start xl:gap-16">
                <div>
                  <div className="flex gap-4">
                   <div>
                   <div className="rounded-[32px] bg-black text-white flex items-center gap-2 px-5 py-2">
                      <UserRound className="mx-auto h-5 w-5 text-white" />
                      <p className=" text-sm font-semibold">{blog.author}</p>
                    </div>
                   </div>
                   <div>
                   <div className="rounded-[32px] bg-black text-white flex items-center gap-2 px-5 py-2">
                   <CalendarDays className="mx-auto h-5 w-5 text-white" />
                   <p className="text-sm font-semibold">{formatBlogDate(blog.published_at)}</p>
                    </div>
                   </div>
                   <div>
                   <div className="rounded-[32px] bg-black text-white flex items-center gap-2 px-5 py-2">
                   <Tag className="mx-auto h-5 w-5 text-white" />
                   <p className="text-sm font-semibold">{blog.category}</p>
                    </div>
                   </div>
                    
                  
                  </div>

                  <div
                    className="blog-content mt-10 rounded-[32px] bg-[#fffdf9] p-6 text-[#2a211a] shadow-sm sm:p-8 md:p-10"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                </div>

                <aside className="lg:sticky lg:top-28">
                  <div className="rounded-[32px] bg-[#fffdf9] p-5 shadow-sm">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a6b4e]">
                      Filed under
                    </p>
                    <h2 className="mt-3 text-3xl font-display uppercase leading-none tracking-normal">
                      {blog.category}
                    </h2>
                    <div className="mt-5 flex flex-wrap gap-2">
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
                    <Link
                      href="/blog"
                      className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#ded3c8] bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:border-[#1b1511]"
                    >
                      Back to journal
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </article>

        {relatedBlogs.length ? (
          <section className="border-t border-[#d8cec1] bg-[#f4eee7] py-16 md:py-24">
            <div className="site-container">
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">
                    Keep reading
                  </p>
                  <h2 className="mt-3 text-4xl font-display uppercase leading-none tracking-normal">
                    Related stories
                  </h2>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:text-[#8a5f3b]"
                >
                  View all
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedBlogs.map((relatedBlog) => (
                  <Link
                    key={relatedBlog.id}
                    href={`/blog/${relatedBlog.slug}`}
                    className="group block overflow-hidden rounded-[10px] bg-[#fffdf9] shadow-sm transition-shadow duration-300 hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-[#e8ded3]">
                      {relatedBlog.featured_image ? (
                        <Image
                          src={relatedBlog.featured_image}
                          alt={relatedBlog.title}
                          fill
                          sizes="(min-width: 768px) 31vw, calc(100vw - 48px)"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(27,21,17,0.04),rgba(27,21,17,0.08)_45%,rgba(27,21,17,0.52))] opacity-80 transition group-hover:opacity-100" />
                      <div className="absolute inset-x-4 bottom-4 text-white">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ead7c3]">
                          {relatedBlog.category}
                        </p>
                        <h3 className="mt-2 text-xl font-display uppercase leading-none tracking-normal">
                          {relatedBlog.title}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a6b4e]">
                        {formatBlogDate(relatedBlog.published_at)}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#7d746d]">
                        {relatedBlog.short_description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
