import type { Metadata } from "next";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { getPublishedBlogs } from "@/lib/blogs";

import BlogListing from "./blog-listing";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Studio Haritham",
  description: "Read Studio Haritham journal stories on pottery, ceramics, handmade earthware, and studio craft.",
};

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();

  return (
    <>
      <Navbar forceSolid />
      <BlogListing blogs={blogs} />
      <Footer />
    </>
  );
}
