export function FeaturedGridSkeleton() {
  return (
    <div
      className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Loading featured items"
      aria-live="polite"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="min-h-[520px] animate-pulse border border-[#e1d6cb] bg-[#fffdf9]"
        >
          <div className="aspect-[0.92/1] bg-[#e8ded3]" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-24 bg-[#e8ded3]" />
            <div className="h-4 w-full bg-[#efe7df]" />
            <div className="h-4 w-5/6 bg-[#efe7df]" />
            <div className="h-11 w-full bg-[#e8ded3]" />
          </div>
        </div>
      ))}
    </div>
  );
}

type FeaturedEmptyStateProps = {
  title: string;
  description: string;
};

export function FeaturedEmptyState({
  title,
  description,
}: FeaturedEmptyStateProps) {
  return (
    <div className="border border-dashed border-black/20 bg-[#fffdf9] px-6 py-14 text-center">
      <h3 className="text-2xl font-display tracking-normal text-[#1b1511]">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#7d746d]">
        {description}
      </p>
    </div>
  );
}
