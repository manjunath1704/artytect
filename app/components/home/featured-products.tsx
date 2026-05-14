import ProductCard from "@/app/components/cards/product-card";
import { products } from "@/lib/products";

import { FeaturedEmptyState, FeaturedGridSkeleton } from "./featured-section-states";
import SectionHeader from "./section-header";
import ViewMoreLink from "./view-more-link";

type FeaturedProductsSectionProps = {
  isLoading?: boolean;
};

export default function FeaturedProductsSection({
  isLoading = false,
}: FeaturedProductsSectionProps) {
  const featuredProducts = products.filter((item) => item.featured);

  return (
    <section className="bg-[#fbf8f4] py-16 md:py-24" aria-labelledby="featured-products-title">
      <div className="site-container">
        <SectionHeader
          id="featured-products-title"
          eyebrow="Featured products"
          title="Pieces made for everyday rituals"
          description="A curated edit of handmade forms with tactile finishes, quiet silhouettes, and WhatsApp ordering kept one tap away."
          action={<ViewMoreLink href="/products">View More Products</ViewMoreLink>}
        />

        {isLoading ? <FeaturedGridSkeleton /> : null}

        {!isLoading && featuredProducts.length ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                imageSizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 48px)"
              />
            ))}
          </div>
        ) : null}

        {!isLoading && !featuredProducts.length ? (
          <FeaturedEmptyState
            title="No featured products yet"
            description="Mark products as featured to show them on the homepage."
          />
        ) : null}
      </div>
    </section>
  );
}
