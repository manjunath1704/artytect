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

type ChildCategoryPageProps = {
  params: Promise<{
    parent: string;
    child: string;
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
      return [];
    }

    return data.map((category) => mapCategory(category as CategoryDbRow));
  } catch {
    return [];
  }
}

async function getCategoryProducts(categoryTitle: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "published")
      .eq("category", categoryTitle)
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return [];
    }

    return data.map((row) => mapProductRow(row as ProductRow));
  } catch {
    return [];
  }
}

export default async function ChildCategoryPage({ params }: ChildCategoryPageProps) {
  if (!(await isPublicPageVisible("categories"))) {
    notFound();
  }

  const { parent: parentSlug, child: childSlug } = await params;
  const categories = await getCategories();
  
  const parentCategory = categories.find((item) => item.slug === parentSlug && !item.parentCategoryId);
  if (!parentCategory) {
    notFound();
  }

  const childCategory = categories.find(
    (item) => item.slug === childSlug && item.parentCategoryId === parentCategory.id
  );
  if (!childCategory) {
    notFound();
  }

  const products = await getCategoryProducts(childCategory.title);

  return (
    <>
      <Navbar />
      <main className="bg-[#f5f0eb] text-[#1b1511]">
        <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#1f1a16] text-white">
          <Image
            src={childCategory.heroSrc || childCategory.thumbnailSrc}
            alt={childCategory.title}
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
                <Link
                  href={`/categories/${parentSlug}`}
                  className="mt-5 inline-flex rounded-full border border-white/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ead7c3] transition hover:border-white/60"
                >
                  {parentCategory.title}
                </Link>
                <h1 className="mt-5 text-4xl font-display uppercase leading-[1] tracking-normal sm:text-5xl lg:text-6xl">
                  {childCategory.title}
                </h1>
                <p className="mt-7 max-w-xl text-sm leading-7 text-[#f4e9dc] md:text-base md:leading-8">
                  {childCategory.description}
                </p>
              </div>

              <div className="overflow-hidden rounded-[32px] bg-[#1a1410]/60 p-5 shadow-sm backdrop-blur-md">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-display">{products.length}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Products
                    </p>
                  </div>
                  <div>
                    <p className="text-3xl font-display">—</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#e6d3c1]">
                      Category
                    </p>
                  </div>
                </div>
                <div className="mt-5 border-t border-white/15 pt-4 text-xs leading-6 text-[#ead7c3]">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e9d8c4]">
                    Child Category
                  </p>
                  <p>
                    Browse products in {childCategory.title} category.
                  </p>
                </div>
                <Link
                  href="#products"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1b1511] transition hover:bg-[#ead7c3]"
                >
                  Browse products
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="py-14 md:py-20">
          <div className="site-container">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#d9cfc6] pb-5">
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a6e65]">
                <span>{parentCategory.title}</span>
                <span className="h-3 w-px bg-[#c4b5a8]" />
                <span>{childCategory.title}</span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#7a6e65]">
                <span>{products.length} products</span>
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
                  No products in this category yet
                </h2>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#7a6e65]">
                  Explore other categories while new pieces are added here.
                </p>
                <Link
                  href={`/categories/${parentSlug}`}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#1b1511] px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1b1511] transition-colors duration-200 hover:bg-[#1b1511] hover:text-white"
                >
                  Back to {parentCategory.title}
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
