import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import WhatsAppButton from "@/components/whatsapp-button";
import { prisma } from "@/lib/prisma";
import { products as catalogProducts } from "@/lib/products";
import { formatPrice, getProductOrderMessage } from "@/lib/whatsapp";

type CategoryPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type CategoryCatalog = {
  title: string;
  slug: string;
  description: string;
  thumbnailSrc: string;
  heroSrc: string;
};

const fallbackCategories: CategoryCatalog[] = [
  {
    title: "Bowls",
    slug: "bowls",
    description:
      "Ceramic bowls in soft silhouettes, made for breakfast rituals, shared meals, and everyday serving.",
    thumbnailSrc: "/images/bowl-a.avif",
    heroSrc: "/images/bowl-b.avif",
  },
  {
    title: "Vases",
    slug: "vases",
    description:
      "Balanced vessels with quiet profiles, natural surfaces, and enough presence to stand beautifully alone.",
    thumbnailSrc: "/images/vase-a.avif",
    heroSrc: "/images/vase-b.avif",
  },
  {
    title: "Mugs",
    slug: "mugs",
    description:
      "Comforting hand-held forms with earthy finishes, built for slow mornings and warm drinks.",
    thumbnailSrc: "/images/mug-a.avif",
    heroSrc: "/images/mug-b.avif",
  },
  {
    title: "Planters",
    slug: "planters",
    description:
      "Grounded ceramic planters that bring texture and calm to shelves, tabletops, and sunlit corners.",
    thumbnailSrc: "/images/planter-a.avif",
    heroSrc: "/images/planter-b.avif",
  },
  {
    title: "Plates",
    slug: "plates",
    description:
      "Simple ceramic plates with warm material character, made for hosting, layering, and daily use.",
    thumbnailSrc: "/images/plate-a.avif",
    heroSrc: "/images/plate-b.avif",
  },
  {
    title: "Deep plates",
    slug: "deep-plates",
    description:
      "Deep serving forms with a quiet sculptural profile for soups, grains, salads, and shared dishes.",
    thumbnailSrc: "/images/deep-a.avif",
    heroSrc: "/images/deep-b.avif",
  },
];

async function getCategory(slug: string): Promise<CategoryCatalog | null> {
  const fallbackCategory = fallbackCategories.find((category) => category.slug === slug);

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      select: {
        title: true,
        slug: true,
        description: true,
        thumbnailUrl: true,
        hoverThumbnailUrl: true,
      },
    });

    if (category) {
      return {
        title: category.title,
        slug: category.slug,
        description: category.description,
        thumbnailSrc: category.thumbnailUrl,
        heroSrc: category.hoverThumbnailUrl || category.thumbnailUrl,
      };
    }
  } catch {
    return fallbackCategory ?? null;
  }

  return fallbackCategory ?? null;
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getCategoryProducts(category: CategoryCatalog) {
  return catalogProducts.filter(
    (product) => toSlug(product.category) === category.slug,
  );
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const products = getCategoryProducts(category);

  return (
    <>
      <Navbar />
      <main className="bg-[#f5f0eb] text-[#1b1511]">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#1f1a16] text-white">
          <Image
            src={category.heroSrc}
            alt={category.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,21,17,0.88),rgba(27,21,17,0.52),rgba(27,21,17,0.24))]" />
          {/* <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f5f0eb] to-transparent" /> */}

          <div className="site-container relative flex min-h-[calc(100vh-5rem)] items-end pb-12 pt-20 md:pb-16">
            <div className="grid w-full gap-10 lg:grid-cols-[1fr_340px] lg:items-end">
              <div className="max-w-3xl">
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#e9d8c4] transition-opacity hover:opacity-70"
                >
                  ← Back to categories
                </Link>
                <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:text-5xl lg:text-6xl">
                  {category.title}
                </h1>
                <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
                  {category.description}
                </p>
              </div>

              <div className="overflow-hidden rounded-[32px] shadow-sm bg-[#1a1410]/60 p-5 backdrop-blur-md">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-display">{products.length}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Pieces
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-display">WA</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Order
                    </p>
                  </div>
                </div>
                <div className="mt-5 border-t border-white/15 pt-4 text-xs leading-6 text-[#ead7c3]">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e9d8c4]">
                    Handcrafted collection
                  </p>
                  <p>
                    Each piece is shaped by hand with calm lines and tactile finishes
                    for your daily rituals.
                  </p>
                </div>
                <Link
                  href="#products"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3]"
                >
                  Browse collection
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Product grid ─────────────────────────────────────────── */}
        <section id="products" className="py-14 md:py-20">
          <div className="site-container">

            {/* Toolbar */}
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#d9cfc6] pb-5">
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a6e65]">
                <span>Filter</span>
                <span className="h-3 w-px bg-[#c4b5a8]" />
                <span>Artist</span>
                <span className="h-3 w-px bg-[#c4b5a8]" />
                <span>Color</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a6e65]">
                <span>{products.length} pieces</span>
                <span className="h-3 w-px bg-[#c4b5a8]" />
                <span>Sort by default</span>
              </div>
            </div>

            {products.length ? (
              <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <article key={product.id} className="group overflow-hidden rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-md">

                    {/* Image */}
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#e4d9d0]">
                        {product.badge ? (
                          <span className="absolute left-0 top-0 z-10 rounded-br-lg border-b border-r border-[#d9cfc6] bg-[#f5f0eb] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-[#9a6b4e]">
                            {product.badge}
                          </span>
                        ) : null}
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 48px)"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-[#1b1511] opacity-0 transition-opacity duration-500 group-hover:opacity-8" />
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="border border-t-0 border-[#d9cfc6] bg-[#faf6f2] px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a6b4e]">
                          {product.category}
                        </p>
                        <p className="text-sm font-semibold text-[#1b1511]">
                          {product.compareAtPrice ? (
                            <>
                              <span className="mr-2 text-[#9a8d82] line-through">
                                {formatPrice(product.compareAtPrice)}
                              </span>
                              <span>{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            formatPrice(product.price)
                          )}
                        </p>
                      </div>

                      <Link href={`/products/${product.id}`} className="block">
                        <h2 className="mt-2 text-sm font-semibold uppercase tracking-[0.1em] text-[#1b1511] transition-opacity duration-200 group-hover:opacity-60">
                          {product.name}
                        </h2>
                      </Link>

                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#7a6e65]">
                        {product.shortDescription}
                      </p>

                      <div className="mt-4 grid grid-cols-[1fr_auto] gap-2 border-t border-[#d9cfc6] pt-4">
                        <WhatsAppButton
                          message={getProductOrderMessage(product)}
                          className="h-10 rounded-xl px-4 text-[10px]"
                        >
                          Order Now
                        </WhatsAppButton>
                        <Link
                          href={`/products/${product.id}`}
                          className="inline-flex h-10 items-center justify-center rounded-xl border border-[#d9cfc6] bg-transparent px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition-colors duration-200 hover:border-[#1b1511] hover:bg-[#1b1511] hover:text-white"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>

                  </article>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="rounded-[32px] border border-[#d9cfc6] bg-[#faf6f2] px-8 py-16 text-center shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#9a6b4e]">
                  Coming soon
                </p>
                <h2 className="mt-4 font-display text-3xl uppercase leading-none tracking-[-0.03em] text-[#1b1511] md:text-4xl">
                  No pieces in this collection yet
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#7a6e65]">
                  Explore the complete product catalog while new pieces are added here.
                </p>
                <Link
                  href="/products"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#1b1511] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1b1511] transition-colors duration-200 hover:bg-[#1b1511] hover:text-white"
                >
                  View all products
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

          </div>
        </section>

     

      </main>
      <Footer />
    </>
  );
}
