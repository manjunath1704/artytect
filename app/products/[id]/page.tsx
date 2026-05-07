import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { getProduct, getRelatedProducts, products } from "@/lib/products";
import ProductDetailView from "./product-detail-view";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product.id);

  return (
    <>
      <Navbar forceSolid />
      <main className="bg-white pt-20 text-[#171717]">
        <ProductDetailView product={product} />

        <section className="py-16 md:py-24">
          <div className="site-container">
            <h2 className="text-xl font-semibold uppercase tracking-[0.08em]">
              Related products
            </h2>

            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group block text-center"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f7f5f3]">
                    {relatedProduct.badge ? (
                      <span className="absolute right-4 top-4 z-10 bg-[#f8e8e1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]">
                        {relatedProduct.badge}
                      </span>
                    ) : null}
                    <Image
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, calc(100vw - 48px)"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.12em]">
                    {relatedProduct.name}
                  </h3>
                  <p className="mt-3 text-sm text-[#9a8d82]">
                    {relatedProduct.compareAtPrice ? (
                      <>
                        <span className="mr-2 line-through">
                          ${relatedProduct.compareAtPrice}
                        </span>
                        <span>${relatedProduct.price}</span>
                      </>
                    ) : (
                      `$${relatedProduct.price}`
                    )}
                  </p>
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
