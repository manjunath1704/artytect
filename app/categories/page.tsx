import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { isPublicPageVisible } from "@/lib/public-page-visibility";

import CategoriesPageContent from "./categories-page-content";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  if (!(await isPublicPageVisible("categories"))) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <CategoriesPageContent />
      <Footer />
    </>
  );
}
