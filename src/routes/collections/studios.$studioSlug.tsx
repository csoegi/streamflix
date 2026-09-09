import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { MovieCard } from "@/components/streamflix/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Movie } from "@/lib/types";
import { fetchMovieStudios, fetchMoviesByGenre } from "@/lib/api/tmdb";

const searchParamSchema = z.object({
  genreSlug: z.string().optional(),
  page: z.number().optional().default(1).catch(1),
});

export const Route = createFileRoute("/collections/studios/$studioSlug")({
  validateSearch: searchParamSchema,
  shouldReload: true,
  loader: async ({ params }) => {
    const genreSlug = params.studioSlug;
    const searchParams = new URLSearchParams(location.search);
    const activePage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;

    const [genres, movieList] = await Promise.all([
      fetchMovieStudios(),
      fetchMoviesByGenre({ data : { genreSlug : genreSlug } })
    ]);
    const top10Genres = genres.sort((a, b) => b.count - a.count).slice(0, 10);
    const totalPages = movieList.total_pages;
    const totalResults = movieList.total_results;
    const movies = movieList.results;
    const matchedTerm = genres.find((g) => g.slug === genreSlug);
    const genreName = matchedTerm ? matchedTerm.name : "";

    return { genreId: genreSlug, genreName, top10Genres, movies, totalPages, totalResults, activePage };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.genreName || "Explore"} — StreamFlix` }],
  }),
  pendingComponent: () => (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <section className="relative flex h-[42vh] items-end overflow-hidden sm:h-[52vh]">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none opacity-60" />
        <div className="relative z-10 w-full px-4 pb-8 sm:px-8 md:px-16">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="mt-2 h-10 w-72 rounded sm:h-16" />
          <Skeleton className="mt-3 h-4 w-56 rounded" />
        </div>
      </section>
      <main className="mx-auto max-w-[1800px] px-4 pb-16 sm:px-8">
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="w-full aspect-[2/3] rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  ),
  component: ExploreGenrePage,
});

function ExploreGenrePage() {
  const { genreId, genreName, top10Genres, movies, totalPages, totalResults, activePage } = Route.useLoaderData();
  const navigate = useNavigate();
  const hero = movies[0];
  const visible = movies || []; 
  const pageCount = totalPages; 
  const handlePageChange = (targetPage: number) => {
    navigate({
      to: '.', // Targets the exact active path route location
      search: (prev) => ({ 
        ...prev, 
        page: targetPage // Safely mutates tracked schema integers
      }),
    });
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      {/* Cinematic Hero Header Viewport */}
      <section className="relative flex h-[30vh] items-end overflow-hidden sm:h-[30vh] bg-zinc-950">
        {hero?.backdrop ? (
          <img src={hero.backdrop} alt="" className="absolute inset-0 size-full object-cover opacity-40 blur-sm scale-105" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-surface to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="relative z-10 w-full px-4 pb-8 sm:px-8 md:px-16">
          <div className="flex items-center gap-2 text-emerald-400 drop-shadow">
            <Sparkles className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">Mood</span>
          </div>
          <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-6xl text-white drop-shadow-md">{genreName}</h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/80 sm:text-base drop-shadow">
            {totalResults} titles hand-picked to match this vibe.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1800px] px-4 pb-16 sm:px-8">
        
        {/* Dynamic Category Navigation Chips Panel */}
        <div className="mt-8 flex flex-wrap gap-2">
          {top10Genres.map((g: any) => {
            const currentSlug = g.slug || g.name.toLowerCase().trim().replace(/\s+/g, '-');
            const active = currentSlug === genreId;
            
            return (
              <Link
                key={g.term_id}
                to="/collections/studios/$studioSlug"
                params={{ studioSlug: currentSlug }}
                className={`rounded-full border px-4 py-2 text-sm transition font-medium shadow-sm ${
                  active
                    ? "border-primary bg-primary text-primary-foreground font-semibold scale-105 active"
                    : "border-border text-muted-foreground hover:border-red-500 hover:text-foreground hover:bg-red/5"
                }`}
              >
                {g.name}
              </Link>
            );
          })}
        </div>

        {movies.length > 0 ? (
          <div className="mt-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {visible.map((m: Movie) => (
                <button
                  key={m.id}
                  onClick={() => navigate({ to: "/movies/$id", params: { id: m.id } })}
                  className="w-full text-left transition transform hover:scale-[1.02] duration-200"
                >
                  <MovieCard movie={m} fluid />
                </button>
              ))}
            </div>
            
            {pageCount > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center pt-6 border-t border-white/5">

                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  
                  {/* 1. Jump to FIRST Page (<<) */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={activePage === 1}
                    title="First Page"
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    &laquo;
                  </button>

                  {/* 2. PREVIOUS Button */}
                  <button
                    onClick={() => handlePageChange(Math.max(1, activePage - 1))}
                    disabled={activePage === 1}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    Previous
                  </button>

                  {/* 3. DYNAMIC SLIDING WINDOW NUMBERS CONTROL */}
                  {(() => {
                    const maxVisible = 5;
                    let startPage = Math.max(1, activePage - Math.floor(maxVisible / 2));
                    let endPage = startPage + maxVisible - 1;

                    // Adjust windows constraints securely if hitting max catalog boundaries
                    if (endPage > pageCount) {
                      endPage = pageCount;
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }

                    const visiblePageNumbers = [];
                    for (let pageNum = startPage; endPage >= pageNum; pageNum++) {
                      visiblePageNumbers.push(pageNum);
                    }

                    return visiblePageNumbers.map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`inline-flex size-9 items-center justify-center rounded-lg text-sm font-bold transition shadow-sm ${
                          p === activePage
                            ? "bg-white text-black font-extrabold scale-105 shadow-md"
                            : "border border-border text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                      >
                        {p}
                      </button>
                    ));
                  })()}

                  {/* 4. NEXT Button */}
                  <button
                    onClick={() => handlePageChange(Math.min(pageCount, activePage + 1))}
                    disabled={activePage === pageCount}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    Next
                  </button>

                  {/* 5. Jump to LAST Page (>>) */}
                  <button
                    onClick={() => handlePageChange(pageCount)}
                    disabled={activePage === pageCount}
                    title="Last Page"
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition"
                  >
                    &raquo;
                  </button>

                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-12 text-center text-sm text-muted-foreground">No titles found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
