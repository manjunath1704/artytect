import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <main className="bg-[#fbf8f4] pt-28">
      <div className="site-container grid gap-12 py-12 lg:grid-cols-2">
        <div>
          <Skeleton className="aspect-square rounded-[32px]" />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-square rounded-[28px]" />
            ))}
          </div>
        </div>
        <div className="rounded-[32px] bg-white p-8 shadow-sm">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="mt-6 h-12 w-3/4 rounded-full" />
          <Skeleton className="mt-6 h-5 w-28 rounded-full" />
          <Skeleton className="mt-8 h-24 w-full rounded-[24px]" />
        </div>
      </div>
    </main>
  );
}
