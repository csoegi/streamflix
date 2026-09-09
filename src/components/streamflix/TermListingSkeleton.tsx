import { Navbar } from "@/components/streamflix/Navbar";
import { Skeleton } from "@/components/ui/skeleton";

interface TermListingSkeletonProps {
  hasBannerCount?: boolean;
}

export function TermListingSkeleton({ hasBannerCount = true }: TermListingSkeletonProps) {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      
      {/* Skeleton Banner Layout matching 30vh exactly */}
      <section className="relative flex h-[30vh] items-end overflow-hidden bg-zinc-950/40 border-b border-border">
        <div className="relative z-10 w-full px-4 pb-6 sm:px-8 md:px-16">
          {/* "Explore" tag skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full bg-zinc-800" />
            <Skeleton className="h-4 w-16 rounded bg-zinc-800" />
          </div>
          {/* Heading skeleton */}
          <Skeleton className="mt-2 h-10 w-64 rounded sm:h-14 bg-zinc-800" />
          {/* Subtitle counter skeleton */}
          {hasBannerCount && <Skeleton className="mt-3 h-4 w-24 rounded bg-zinc-800" />}
        </div>
      </section>

      {/* Main Skeleton Listing Controls Frame */}
      <main className="mx-auto max-w-[1800px] px-4 pb-16 sm:px-8">
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
          {/* Search bar input shape skeleton */}
          <Skeleton className="h-11 w-full max-w-md rounded-lg bg-zinc-900/60 border border-zinc-800" />
          {/* Dropdown sort shape skeleton */}
          <Skeleton className="h-11 w-40 rounded-lg bg-zinc-900/60 border border-zinc-800 self-start sm:self-auto" />
        </div>

        {/* 4-Column Grid Skeleton Items */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between h-14 bg-zinc-900/20 border border-zinc-800/60 rounded-xl px-4 py-3"
            >
              {/* Term Name text shape */}
              <Skeleton className="h-4 w-2/3 bg-zinc-800/80 rounded" />
              {/* Term Count badge shape */}
              <Skeleton className="h-5 w-10 bg-zinc-800/80 rounded" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
