import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import ProductCard from "@/app/components/cards/product-card";
import Footer from "@/app/components/home/footer";
import Navbar from "@/app/components/home/navbar";
import { isPublicPageVisible } from "@/lib/public-page-visibility";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type ProductRow } from "@/lib/products";

type CategoryPageProps = {
  params: Promise<{
    parent: string;
  }>;
};

type CategoryCatalog = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailSrc: string;
  heroSrc: string;
  parentCategoryId: string | null;
};

const fallbackCategories: CategoryCatalog[] = [
  {
    id: "bowls",
    title: "Bowls",
    slug: "bowls",
    description:
      "Ceramic bowls in soft silhouettes, made for breakfast rituals, shared meals, and everyday serving.",
    thumbnailSrc: "/images/bowl-a.avif",
    heroSrc: "/images/bowl-b.avif",
    parentCategoryId: null,
  },
  {
    id: "vases",
    title: "Vases",
    slug: "vases",
    description:
      "Balanced vessels with quiet profiles, natural surfaces, and enough presence to stand beautifully alone.",
    thumbnailSrc: "/images/vase-a.avif",
    heroSrc: "/images/vase-b.avif",
    parentCategoryId: null,
  },
  {
    id: "mugs",
    title: "Mugs",
    slug: "mugs",
    description:
      "Comforting hand-held forms with earthy finishes, built for slow mornings and warm drinks.",
    thumbnailSrc: "/images/mug-a.avif",
    heroSrc: "/images/mug-b.avif",
    parentCategoryId: null,
  },
  {
    id: "planters",
    title: "Planters",
    slug: "planters",
    description:
      "Grounded ceramic planters that bring texture and calm to shelves, tabletops, and sunlit corners.",
    thumbnailSrc: "/images/planter-a.avif",
    heroSrc: "/images/planter-b.avif",
    parentCategoryId: null,
  },
  {
    id: "plates",
    title: "Plates",
    slug: "plates",
    description:
      "Simple ceramic plates with warm material character, made for hosting, layering, and daily use.",
    thumbnailSrc: "/images/plate-a.avif",
    heroSrc: "/images/plate-b.avif",
    parentCategoryId: null,
  },
  {
    id: "deep-plates",
    title: "Deep plates",
    slug: "deep-plates",
    description:
      "Deep serving forms with a quiet sculptural profile for soups, grains, salads, and shared dishes.",
    thumbnailSrc: "/images/deep-a.avif",
    heroSrc: "/images/deep-b.avif",
    parentCategoryId: null,
  },
];

type CategoryDbRow = {
  id: string;
  category_name: string | null;
  category_slug: string | null;
  category_description: string | null;
  category_thumbnail: string | null;
  category_hover_thumbnail: string | null;
  parent_category_id: string | null;
};

function mapCategory(row: CategoryDbRow): CategoryCatalog {
  return {
    id: String(row.id),
    title: row.category_name || "",
    slug: row.category_slug || "",
    description: row.category_description || "",
    thumbnailSrc: row.category_thumbnail || "",
    heroSrc: row.category_hover_thumbnail || row.category_thumbnail || "",
    parentCategoryId: row.parent_category_id ? String(row.parent_category_id) : null,
  };
}

async function getCategories(): Promise<CategoryCatalog[]> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("categories")
      .select("id, category_name, category_slug, category_description, category_thumbnail, category_hover_thumbnail, parent_category_id")
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return fallbackCategories;
    }

    return data.map((category) => mapCategory(category as CategoryDbRow));
  } catch {
    return fallbackCategories;
  }
}

async function getCategoryProducts(categoryTitles: string[]) {
  try {
    const supabase = await createClient();
    
    console.log('Querying products with category titles:', categoryTitles);
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .in("category", categoryTitles)
      .order("created_at", { ascending: false });

    console.log('Query result:', { data, error, count: data?.length });

    if (error) {
      console.error('Query error:', error);
      return [];
    }
    
    if (!data?.length) {
      console.log('No products found');
      return [];
    }

    const products = data.map((row) => mapProductRow(row as ProductRow));
    console.log('Mapped products:', products.length);
    return products;
  } catch (err) {
    console.error('Exception in getCategoryProducts:', err);
    return [];
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  if (!(await isPublicPageVisible("categories"))) {
    notFound();
  }

  const { parent } = await params;
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === parent);

  if (!category) {
    notFound();
  }

  const childCategories = categories
    .filter((item) => item.parentCategoryId === category.id)
    .sort((a, b) => a.title.localeCompare(b.title));
  const parentCategory = category.parentCategoryId
    ? categories.find((item) => item.id === category.parentCategoryId) ?? null
    : null;
  
  console.log('Current category:', category.title, 'Parent:', parentCategory?.title);
  console.log('Child categories:', childCategories.map(c => c.title));
  
  // For parent category pages: show products from all child categories
  // For child category pages: show products assigned to this child category
  const productCategories = category.parentCategoryId ? [category] : [category, ...childCategories];
  const categoryTitles = productCategories.map((cat) => cat.title);
  
  console.log('Searching for products in categories:', categoryTitles);
  
  const products = await getCategoryProducts(categoryTitles);
  
  console.log('Found products:', products.length);

  return (
    <>
      <Navbar />
      <main className="bg-[#f5f0eb] text-[#1b1511]">
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#1f1a16] text-white">
          <Image
            src={category.heroSrc || category.thumbnailSrc}
            alt={category.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(27,21,17,0.88),rgba(27,21,17,0.52),rgba(27,21,17,0.24))]" />

          <div className="site-container relative flex min-h-[calc(100vh-5rem)] items-end pb-12 pt-20 md:pb-16">
            <div className="grid w-full gap-10 lg:grid-cols-[1fr_340px] lg:items-end">
              <div className="max-w-3xl">
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#e9d8c4] transition-opacity hover:opacity-70"
                >
                  Back to categories
                </Link>
                {parentCategory && (
                  <Link
                    href={`/categories/${parentCategory.slug}`}
                    className="mt-5 inline-flex rounded-full border border-white/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ead7c3] transition hover:border-white/60"
                  >
                    {parentCategory.title}
                  </Link>
                )}
                <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:text-5xl lg:text-6xl">
                  {category.title}
                </h1>
                <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
                  {category.description}
                </p>
              </div>

              <div className="overflow-hidden rounded-[32px] bg-[#1a1410]/60 p-5 shadow-sm backdrop-blur-md">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-display">{products.length}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Pieces
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-display">{childCategories.length}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Subcategories
                    </p>
                  </div>
                </div>
                <div className="mt-5 border-t border-white/15 pt-4 text-xs leading-6 text-[#ead7c3]">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e9d8c4]">
                    {category.parentCategoryId ? "Child category" : "Parent category"}
                  </p>
                  <p>
                    {category.parentCategoryId
                      ? "Browse pieces curated within this subcategory."
                      : "Browse this parent collection and its child categories."}
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

        {childCategories.length > 0 && (
          <section className="py-14 md:py-20">
            <div className="site-container">
              <div className="mb-8 border-b border-[#d9cfc6] pb-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#9a6b4e]">
                  Subcategories
                </p>
                <h2 className="mt-3 font-display text-3xl uppercase leading-none text-[#1b1511] md:text-4xl">
                  Explore {category.title}
                </h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {childCategories.map((child) => (
                  <Link
                    key={child.id}
                    href={`/categories/${parent}/${child.slug}`}
                    className="group grid rounded-[32px] shadow-sm bg-[#faf6f2] transition overflow-hidden"
                  >
                    <div className="relative aspect-[1/1] overflow-hidden  bg-[#e4d9d0]">
                      <Image
                        src={child.thumbnailSrc}
                        alt={child.title}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                      <div className="p-4 absolute start-4 bottom-4 end-4 rounded-[18px] bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-10 shadow-md border border-white/30">
                      <h3 className="font-display text-3xl leading-none text-white">
                        {child.title}
                      </h3>
                      <p className=" line-clamp-2 text-sm leading-6 text-white">
                        {child.description}
                      </p>
                    </div>
                    </div>
                    
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="products" className="py-14 md:py-20">
          <div className="site-container">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#d9cfc6] pb-5">
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a6e65]">
                <span>{category.parentCategoryId ? "Child Category" : "Parent Category"}</span>
                <span className="h-3 w-px bg-[#c4b5a8]" />
                <span>{parentCategory?.title ?? category.title}</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a6e65]">
                <span>{products.length} pieces</span>
                <span className="h-3 w-px bg-[#c4b5a8]" />
                <span>{productCategories.length} categories</span>
              </div>
            </div>

            {products.length ? (
              <div className="grid grid-cols-2 gap-3 md:gap-7 lg:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-[32px] border border-[#d9cfc6] bg-[#faf6f2] px-8 py-16 text-center shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#9a6b4e]">
                  Coming soon
                </p>
                <h2 className="mt-4 font-display text-3xl uppercase leading-none tracking-normal text-[#1b1511] md:text-4xl">
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
