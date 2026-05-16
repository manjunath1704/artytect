import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { getProduct, getRelatedProducts, products } from "@/lib/products";
import { formatPrice } from "@/lib/whatsapp";
import ProductDetailView from "./product-detail-view";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.id,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product.id);

  return (
    <>
      <Navbar transparentTone="dark" />
      <main className="bg-white text-[#171717]">
        <ProductDetailView product={product} />

        <section className="bg-[#f4eee7] py-16 md:py-24">
          <div className="site-container">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">
                  More from the studio
                </p>
                <h2 className="mt-3 text-4xl font-display uppercase leading-none tracking-normal">
                  Related products
                </h2>
              </div>
              <Link
                href="/products"
                className="text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:text-[#8a5f3b]"
              >
                View catalog
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group block overflow-hidden rounded-[32px] shadow-sm bg-[#fffdf9]"
                >
                  <div className="relative aspect-[0.95/1] overflow-hidden bg-[#eee6dc]">
                    {/* {relatedProduct.badge ? (
                      <span className="absolute right-4 top-4 z-10 border border-white/45 bg-[#1b1511]/75 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur">
                        {relatedProduct.badge}
                      </span>
                    ) : null} */}
                    <Image
                      src={relatedProduct.images[1]}
                      alt={relatedProduct.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, calc(100vw - 48px)"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9a6b4e]">
                      {relatedProduct.category}
                    </p>
                    <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.12em] transition group-hover:text-[#8a5f3b]">
                      {relatedProduct.name}
                    </h3>
                    <p className="mt-3 text-sm text-[#8a7765]">
                      {relatedProduct.compareAtPrice ? (
                        <>
                          <span className="mr-2 line-through">
                            {formatPrice(relatedProduct.compareAtPrice)}
                          </span>
                          <span className="font-semibold text-[#1b1511]">
                            {formatPrice(relatedProduct.price)}
                          </span>
                        </>
                      ) : (
                        <span className="font-semibold text-[#1b1511]">
                          {formatPrice(relatedProduct.price)}
                        </span>
                      )}
                    </p>
                  </div>
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
