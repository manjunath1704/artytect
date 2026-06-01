import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { getPublishedProducts } from "@/lib/product-queries";
import { isPublicPageVisible } from "@/lib/public-page-visibility";

import ProductsPageContent from "./products-page-content";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  if (!(await isPublicPageVisible("products"))) {
    notFound();
  }
  const products = await getPublishedProducts();

  return (
    <>
      <Navbar />
      <ProductsPageContent products={products} />
      <Footer />
    </>
  );
}
