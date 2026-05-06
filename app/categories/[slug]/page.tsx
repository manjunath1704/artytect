import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { prisma } from "@/lib/prisma";

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

const productImagesBySlug: Record<string, string[]> = {
  bowls: [
    "/images/bowl-a.avif",
    "/images/bowl-b.avif",
    "/images/deep-a.avif",
    "/images/deep-b.avif",
    "/images/gallery/pexels-readymade-3847457.jpg",
    "/images/gallery/pexels-readymade-3847438.jpg",
  ],
  vases: [
    "/images/vase-a.avif",
    "/images/vase-b.avif",
    "/images/gallery/pexels-jessejames-16691991.jpg",
    "/images/gallery/pexels-handanovijc-12859531.jpg",
    "/images/gallery/pexels-picdrow-10995878.jpg",
    "/images/gallery/pexels-karola-g-7588511.jpg",
  ],
  mugs: [
    "/images/mug-a.avif",
    "/images/mug-b.avif",
    "/images/gallery/pexels-rdne-8903648.jpg",
    "/images/gallery/pexels-ron-lach-10222718.jpg",
    "/images/gallery/pexels-ivan-s-7119222.jpg",
    "/images/gallery/pexels-mart-production-8217302.jpg",
  ],
  planters: [
    "/images/planter-a.avif",
    "/images/planter-b.avif",
    "/images/gallery/pexels-karola-g-6920401.jpg",
    "/images/gallery/pexels-karola-g-6805523.jpg",
    "/images/gallery/pexels-makaroff-aleksandr-114409006-10401476.jpg",
    "/images/gallery/pexels-ramon-clemente-1097299-6546576.jpg",
  ],
  plates: [
    "/images/plate-a.avif",
    "/images/plate-b.avif",
    "/images/deep-a.avif",
    "/images/deep-b.avif",
    "/images/gallery/pexels-readymade-3847438.jpg",
    "/images/gallery/pexels-stephanie-loewe-23778814-6842672.jpg",
  ],
  "deep-plates": [
    "/images/deep-a.avif",
    "/images/deep-b.avif",
    "/images/plate-a.avif",
    "/images/plate-b.avif",
    "/images/gallery/pexels-readymade-3847467.jpg",
    "/images/gallery/pexels-photogbasya-a-1171505293-29665160.jpg",
  ],
};

const generalProductImages = [
  "/images/bowl-a.avif",
  "/images/vase-a.avif",
  "/images/mug-a.avif",
  "/images/plate-a.avif",
  "/images/planter-a.avif",
  "/images/deep-a.avif",
];

const productQualities = [
  "Unique",
  "Soft",
  "Studio",
  "Hand-thrown",
  "Textured",
  "Quiet",
  "Raw edge",
  "Layered",
  "Matte",
  "Everyday",
  "Limited",
  "Signature",
];

const artisans = [
  "Leontina di Gioia",
  "Karin Blanch Nielsen",
  "Yuko Ando",
  "Tybo",
  "Emma Hardin",
  "Feldspar",
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

function getCategoryProducts(category: CategoryCatalog) {
  const images = productImagesBySlug[category.slug] ?? generalProductImages;
  const singularTitle = category.title.replace(/s$/i, "");

  return Array.from({ length: 12 }, (_, index) => ({
    id: `${category.slug}-${index + 1}`,
    name: `${productQualities[index]} ${singularTitle}`,
    artisan: artisans[index % artisans.length],
    price: `₹${(1295 + index * 365).toLocaleString("en-IN")}`,
    image: images[index % images.length],
  }));
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

            <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="group text-center"
                >
                  <div className="relative aspect-[1.15/1] overflow-hidden bg-[#e8dfd2]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 48px)"
                      className="object-cover transition duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <h2 className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#1b1511]">
                    {product.name}
                  </h2>
                  <p className="mt-1 text-xs text-[#5e5348]">by {product.artisan}</p>
                  <p className="mt-2 text-xs text-[#1b1511]">{product.price}</p>
                </article>
              ))}
            </div>

            <div className="mt-16 text-center">
              <button
                type="button"
                className="border border-[#1b1511] px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#1b1511] transition hover:bg-[#1b1511] hover:text-[#fcfdfa]"
              >
                Load more
              </button>
            </div>
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
