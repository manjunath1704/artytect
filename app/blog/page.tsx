import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { isPublicPageVisible } from "@/lib/public-page-visibility";
import { getPublishedBlogs } from "@/lib/blogs";

import BlogListing from "./blog-listing";
import BlogHero from "../components/blog/hero";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Studio Haritham",
  description: "Read Studio Haritham journal stories on pottery, ceramics, handmade earthware, and studio craft.",
};

export default async function BlogPage() {
  if (!(await isPublicPageVisible("blog"))) {
    notFound();
  }

  const blogs = await getPublishedBlogs();

  return (
    <>
      <Navbar  />
      <BlogHero/>
      <BlogListing blogs={blogs} />
      <Footer />
    </>
  );
}
