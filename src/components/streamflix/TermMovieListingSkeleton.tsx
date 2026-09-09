import { Navbar } from "@/components/streamflix/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

interface TermMovieListingSkeletonProps {
  chipCount?: number;
  cardCount?: number;
}

export function TermMovieListingSkeleton({ 
  chipCount = 10, 
  cardCount = 12 
}: TermMovieListingSkeletonProps) {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      
      {/* Skeleton Banner Layout */}
      <section className="relative flex h-[30vh] items-end overflow-hidden bg-zinc-950/40 border-b border-border">
        <div className="relative z-10 w-full px-4 pb-8 sm:px-8 md:px-16">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-zinc-800" />
            <Skeleton className="h-4 w-16 rounded bg-zinc-800" />
          </div>
          <Skeleton className="mt-2 h-10 w-72 rounded sm:h-16 bg-zinc-800" />
          <Skeleton className="mt-3 h-4 w-56 rounded bg-zinc-800" />
        </div>
      </section>

      {/* Main Skeleton Grid Controls Frame */}
      <main className="mx-auto max-w-[1800px] px-4 pb-16 sm:px-8">
        
        {/* Dynamic Nav Chips Row Skeleton */}
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: chipCount }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full bg-zinc-900/60" />
          ))}
        </div>
        
        {/* Movie Listing Responsive Grid Skeleton */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {Array.from({ length: cardCount }).map((_, i) => (
            <div key={i} className="w-full aspect-[2/3] bg-zinc-900/20 border border-zinc-800/40 rounded-xl overflow-hidden p-1 flex flex-col gap-2">
              <Skeleton className="w-full h-[82%] rounded-lg bg-zinc-800/60" />
              <Skeleton className="h-4 w-5/6 mx-auto bg-zinc-800/40 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
