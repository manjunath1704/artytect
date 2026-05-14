import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
      <Navbar forceSolid />
      <main className="bg-[#f7f2ed] pt-20 text-[#1b1511]">
        <section className="py-16 md:py-24">
          <div className="site-container">
            <div className="grid gap-10 md:grid-cols-[0.72fr_1fr] md:items-end md:gap-16">
              <div>
                <Link
                  href="/#collections"
                  className=" inline-flex text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8a7765] transition hover:text-[#1b1511]"
                >
                  Catalog
                </Link>
                <h1 className="text-6xl font-display uppercase tracking-[-0.07em] sm:text-7xl lg:text-8xl">
                  {category.title}
                </h1>
                <p className="mt-7 max-w-sm text-xs font-semibold uppercase leading-6 tracking-[0.08em] text-[#4f453c]">
                  {category.description}
                </p>
              </div>

              <div className="relative aspect-[1.12/1] overflow-hidden bg-[#e9e0d7]">
                <Image
                  src={category.heroSrc}
                  alt={category.title}
                  fill
                  priority
                  sizes="(min-width: 768px) 58vw, calc(100vw - 48px)"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20">
          <div className="site-container">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-5 border-y border-[#d8cec1] py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5e5348]">
              <div className="flex flex-wrap items-center gap-4">
                <span>Filter</span>
                <span>Artist</span>
                <span>Color</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span>{products.length} pieces</span>
                <span>Sort by default</span>
              </div>
            </div>

            {products.length ? (
            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group overflow-hidden border border-[#d8cec1] bg-[#fcfaf7] shadow-[0_18px_50px_rgba(27,21,17,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(27,21,17,0.1)]"
                >
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="relative aspect-[1.15/1] overflow-hidden bg-[#e8dfd2]">
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
                        className="object-cover transition duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="p-5 text-left">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a7765]">
                        {product.category}
                      </p>
                      <p className="text-sm font-semibold text-[#1b1511]">
                        {product.compareAtPrice ? (
                          <>
                            <span className="mr-2 text-[#8a7765] line-through">
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
                      <h2 className="mt-3 text-base font-semibold uppercase tracking-[0.08em] text-[#1b1511] transition group-hover:text-[#8a5f3b]">
                        {product.name}
                      </h2>
                    </Link>
                    <p className="mt-3 line-clamp-2 min-h-[3.5rem] text-sm leading-7 text-[#5e5348]">
                      {product.shortDescription}
                    </p>

                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                      <WhatsAppButton
                        message={getProductOrderMessage(product)}
                        className="h-11 px-4"
                      >
                        Order Now
                      </WhatsAppButton>
                      <Link
                        href={`/products/${product.id}`}
                        className="inline-flex h-11 items-center justify-center border border-[#d8cec1] px-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:border-[#1b1511]"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            ) : (
            <div className="border border-dashed border-[#d8cec1] bg-[#fcfaf7] px-6 py-14 text-center">
              <h2 className="text-2xl font-display tracking-[-0.035em]">
                No products in this category yet
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#5e5348]">
                Explore the complete product catalog while new pieces are added here.
              </p>
              <Link
                href="/products"
                className="mt-6 inline-flex border border-[#1b1511] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:bg-[#1b1511] hover:text-white"
              >
                View all products
              </Link>
            </div>
            )}
          </div>
        </section>

        <section className="pb-20 pt-10">
          <div className="site-container">
            <div className="border-t border-[#d8cec1] pt-14">
              <h2 className="text-3xl font-display uppercase tracking-[-0.05em] md:text-5xl">
                Subscribe our newsletter get 10% off your first order
              </h2>
              <form className="mt-10 flex max-w-3xl items-center border-b border-[#1b1511]">
                <input
                  type="email"
                  aria-label="Email address"
                  placeholder="Enter your email address"
                  className="min-w-0 flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-[#7b7065]"
                />
                <button
                  type="submit"
                  className="px-4 py-4 text-xs font-semibold uppercase tracking-[0.16em]"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
