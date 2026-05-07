import Image from "next/image";
import Link from "next/link";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { products } from "@/lib/products";

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

        <section className="py-14 md:py-20">
          <div className="site-container">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.24em]">
                All products
              </h2>
              <p className="text-xs uppercase tracking-[0.18em] text-[#8a817a]">
                {products.length} pieces
              </p>
            </div>

            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block text-center"
                >
                  <div className="relative aspect-[1.03/1] overflow-hidden bg-[#f7f5f3]">
                    {product.badge ? (
                      <span className="absolute right-4 top-4 z-10 bg-[#f8e8e1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]">
                        {product.badge}
                      </span>
                    ) : null}
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 48px)"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.12em]">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-sm text-[#9a8d82]">${product.price}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
