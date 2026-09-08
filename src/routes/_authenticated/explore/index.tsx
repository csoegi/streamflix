import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Compass, Sparkles, Search, ChevronDown } from "lucide-react";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchGenres } from "@/lib/api/tmdb";
import type { WPTerm } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/explore/")({
  loader: async () => {
    const [genres] = await Promise.all([fetchGenres()]);
    return { genres: genres };
  },
  head: () => ({ meta: [{ title: "Explore — StreamFlix" }] }),
  pendingComponent: () => (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <section className="relative flex h-[38vh] items-end overflow-hidden sm:h-[46vh]">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none opacity-60" />
        <div className="relative z-10 w-full px-4 pb-8 sm:px-8 md:px-16">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="mt-2 h-10 w-64 rounded sm:h-14" />
          <Skeleton className="mt-3 h-4 w-72 rounded" />
        </div>
      </section>
      <main className="mx-auto max-w-[1800px] px-4 pb-16 sm:px-8">
        <div className="mt-8 flex justify-between gap-4">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  ),
  component: ExplorePage,
});

type SortOption = "videos" | "alpha";

function ExplorePage() {
  const { genres } = Route.useLoaderData();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("videos");

  // Local processing pipeline (Search filtering + Sorting actions)
  const processedGenres = useMemo(() => {
    let list = [...genres];

    // 1. Handle String Filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((g: any) => g.name.toLowerCase().includes(q));
    }

    // 2. Handle List Sorting Rules
    if (sortBy === "videos") {
      list.sort((a: any, b: any) => (b.count || 0) - (a.count || 0));
    } else if (sortBy === "alpha") {
      list.sort((a: any, b: any) => a.name.localeCompare(b.name));
    }

    return list;
  }, [genres, searchQuery, sortBy]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      {/* Cinematic Banner */}
      <section className="relative flex h-[36vh] items-end overflow-hidden sm:h-[36vh] bg-zinc-950/40 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 via-surface to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="relative z-10 w-full px-4 pb-6 sm:px-8 md:px-16">
          <div className="flex items-center gap-2 text-purple-300">
            <Compass className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">Explore</span>
          </div>
          <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-6xl text-white">Pick a mood</h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/80 sm:text-base">
            {processedGenres.length} genres.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-[1800px] px-4 pb-16 sm:px-8">        
        {/* Controls Layout Layer */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">
  
          {/* Functional Search Bar Wrapper Input */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-zinc-900/60 border border-zinc-800 rounded-lg pl-10 pr-4 text-sm font-medium placeholder-zinc-500 text-zinc-100 transition focus:outline-none focus:border-zinc-700 focus:bg-zinc-900"
            />
          </div>

          {/* 💡 Filtering Dropdown Select Container */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none h-11 bg-zinc-900/60 border border-zinc-800 rounded-lg pl-4 pr-10 text-sm font-semibold text-zinc-200 cursor-pointer focus:outline-none focus:bg-zinc-900 border-zinc-700 transition"
              >
                <option value="videos">Most videos</option>
                <option value="alpha">Alphabetically</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 2-Column Mobile / 4-Column Desktop Display Grid Layout */}
        {processedGenres.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {processedGenres.map((g: any) => {
              const genreSlug = g.slug || g.name.toLowerCase().trim().replace(/\s+/g, '-');
              
              return (
                <Link
                  key={g.term_id || g.id}
                  to="/explore/$genreId"
                  params={{ genreId: genreSlug }} 
                  className="flex items-center justify-between h-14 bg-zinc-900/30 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-pink-500 hover:bg-zinc-800/40 group shadow-sm"
                >
                  <span className="truncate group-hover:text-white transition duration-150">
                    {g.name}
                  </span>
                  {g.count !== undefined && (
                    <span className="text-xs text-zinc-500 font-mono tracking-tight bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/60 hover:text-pink-500">
                      {Number(g.count).toLocaleString()}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          /* Missing State fallbacks block */
          <div className="mt-16 text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
            <p className="text-zinc-400 font-medium">No genres found matching "{searchQuery}"</p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-primary font-semibold hover:underline"
            >
              Clear search input query
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
