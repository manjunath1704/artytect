import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { products } from "@/lib/products";
import ProductCatalog from "./product-catalog";

export default function ProductsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-white text-[#171717]">
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#211914] text-white">
          <Image
            src="/images/gallery/pexels-readymade-3847457.jpg"
            alt="Handmade ceramic tableware arranged on a studio table"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,18,14,0.84),rgba(24,18,14,0.5),rgba(24,18,14,0.2))]" />
          {/* <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white to-transparent" /> */}

          <div className="site-container relative flex min-h-[calc(100vh-5rem)] items-end pb-12 pt-20 md:pb-16">
            <div className="grid w-full gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
              <div className="max-w-3xl">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#ead7c3]">
                  <Sparkles className="h-4 w-4" />
                  Shop ceramics
                </p>
                <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:text-7xl lg:text-8xl">
                  Objects for quiet daily living
                </h1>
                <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
                  Bowls, plates, mugs, planters, and vessels shaped with calm lines,
                  tactile finishes, and a studio-made sense of warmth.
                </p>
                <Link
                  href="#catalog"
                  className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3]"
                >
                  Browse catalog
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="overflow-hidden rounded-[32px] border border-white/18 bg-[#17110d]/55 p-5 backdrop-blur-md">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-display">{products.length}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Pieces
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display">
                      {new Set(products.map((product) => product.category)).size}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Forms
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-display">WA</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Order
                    </p>
                  </div>
                </div>
                <p className="mt-5 border-t border-white/15 pt-4 text-xs leading-6 text-[#ead7c3]">
                  Choose a piece, tap Order Now, and send the product details
                  directly through WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div id="catalog">
          <ProductCatalog products={products} />
        </div>
      </main>
      <Footer />
    </>
  );
}
