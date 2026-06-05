import { notFound } from "next/navigation";
import Navbar from "@/app/components/home/navbar";
import Footer from "@/app/components/home/footer";
import { isPublicPageVisible } from "@/lib/public-page-visibility";
import OurStoryPageContent from "./our-story-page-content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our Story | Handcrafted Ceramics",
  description: "Discover the journey behind our handmade pottery and the passion that drives our craft.",
};

export default async function OurStoryPage() {
  if (!(await isPublicPageVisible("our-story"))) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <OurStoryPageContent />
      <Footer />
    </>
  );
}
