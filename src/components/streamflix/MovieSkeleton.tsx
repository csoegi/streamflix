import { Navbar } from "@/components/streamflix/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

export function MovieSkeleton() {
  return (
    <>
      <section className="relative min-h-[70vh] pt-16 md:min-h-[85vh] md:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[52vh] overflow-hidden sm:h-[58vh] md:inset-y-0 md:h-auto">
          <Skeleton className="absolute inset-0 size-full rounded-none bg-surface/60" />
        </div>
        <div className="relative z-10 w-full min-w-0 px-4 py-10 sm:px-8 md:px-12 md:py-16 lg:px-16">
          <Skeleton className="mb-6 h-9 w-24 rounded-full" />
          <div className="grid w-full min-w-0 gap-10 md:grid-cols-3 md:items-center md:gap-8">
            <div className="min-w-0 space-y-4 md:col-span-2">
              <Skeleton className="mb-4 h-16 w-72 max-w-full rounded-md sm:h-20 md:h-24 md:w-80" />
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-20 rounded-full sm:h-8 sm:w-24" />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))}
              </div>
              <div className="min-w-0">
                <Skeleton className="h-4 w-full max-w-xl rounded sm:h-5" />
                <Skeleton className="mt-2 h-4 w-full max-w-xl rounded sm:h-5" />
                <Skeleton className="mt-2 h-4 w-2/3 max-w-xl rounded sm:h-5" />
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:gap-3">
                <Skeleton className="h-10 w-24 rounded-md sm:h-12 sm:w-28" />
                <Skeleton className="h-10 w-24 rounded-md sm:h-12 sm:w-32" />
                <Skeleton className="h-10 w-24 rounded-md sm:h-12 sm:w-28" />
                <Skeleton className="size-11 rounded-full sm:size-12" />
                <Skeleton className="size-11 rounded-full sm:size-12" />
              </div>
              <div className="min-w-0 pt-4">
                <Skeleton className="mb-3 h-5 w-16 rounded" />
                <div className="flex gap-3 overflow-hidden py-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="w-20 shrink-0 aspect-square rounded-xl sm:w-24" />
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden min-w-0 md:col-span-1 md:block">
              <Skeleton className="w-full max-w-80 aspect-[2/3] rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}