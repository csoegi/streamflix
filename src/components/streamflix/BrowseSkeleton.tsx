import { Navbar } from "@/components/streamflix/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { RowSkeleton } from "@/components/streamflix/RowSkeleton";

interface BrowseSkeletonProps {
  isHomePage?: boolean;
}

export function BrowseSkeleton({ isHomePage = false } : BrowseSkeletonProps) {
  return (
    <>
      <div className="relative min-h-[40vh] h-[50vh] w-full overflow-hidden bg-surface/60 sm:min-h-[400px] sm:h-[65vh] lg:min-h-[550px] lg:h-[85vh]">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none opacity-60" />
        <div className="relative flex h-full items-end justify-center px-4 pb-8 pt-10 text-center sm:px-8 md:items-end md:justify-start">
          <div className="w-full max-w-none space-y-3 text-center md:max-w-3xl md:text-left">
            <div className="hidden sm:block">
              <Skeleton className="h-5 w-32 rounded mx-auto sm:mx-0" />
            </div>
            <Skeleton className="h-8 w-full max-w-lg rounded sm:h-14" />
            <Skeleton className="h-4 w-72 rounded mx-auto sm:mx-0" />
            <div className="flex gap-2 pt-1 justify-center md:justify-start">
              <Skeleton className="h-9 w-20 rounded-md sm:h-12 sm:w-28" />
              <Skeleton className="h-9 w-20 rounded-md sm:h-12 sm:w-32" />
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 space-y-6 md:mt-12 md:space-y-12">
        {isHomePage && <RowSkeleton />}
        {[1, 2, 3, 4, 5].map((i) => (
          <RowSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
