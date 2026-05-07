import Image from "next/image";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { products } from "@/lib/products";
import ProductCatalog from "./product-catalog";

export default function ProductsPage() {
  return (
    <>
      <Navbar forceSolid />
      <main className="bg-white pt-20 text-[#171717]">
        <section className="relative overflow-hidden border-b border-black/10">
          <div className="site-container grid min-h-[520px] gap-10 py-16 md:grid-cols-[0.86fr_1.14fr] md:items-center md:py-20">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[#9a8d82]">
                Shop ceramics
              </p>
              <h1 className="mt-5 text-5xl font-display uppercase leading-none tracking-[-0.06em] sm:text-7xl lg:text-8xl">
                Objects for quiet daily living
              </h1>
              <p className="mt-6 max-w-md text-sm leading-7 text-[#7d746d]">
                Bowls, plates, mugs, planters, and vessels shaped with calm lines,
                tactile finishes, and a studio-made sense of warmth.
              </p>
            </div>

            <div className="relative aspect-[1.18/1] min-h-[320px] overflow-hidden bg-[#f5f2ef]">
              <Image
                src="/images/gallery/pexels-readymade-3847457.jpg"
                alt="Handmade ceramic tableware"
                fill
                priority
                sizes="(min-width: 768px) 56vw, calc(100vw - 48px)"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <ProductCatalog products={products} />
      </main>
      <Footer />
    </>
  );
}
