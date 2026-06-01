import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <main className="bg-white pt-28">
      <div className="site-container grid gap-6 py-12 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-[32px] bg-[#fffdf9] p-4 shadow-sm">
            <Skeleton className="aspect-[4/3] rounded-[28px]" />
            <Skeleton className="mt-4 h-4 w-2/3 rounded-full" />
            <Skeleton className="mt-3 h-4 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    </main>
  );
}
