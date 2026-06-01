import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { isPublicPageVisible } from "@/lib/public-page-visibility";

import ClassesPageContent from "./classes-page-content";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  if (!(await isPublicPageVisible("classes"))) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <ClassesPageContent />
      <Footer />
    </>
  );
}
