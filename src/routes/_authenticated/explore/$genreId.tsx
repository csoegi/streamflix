import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { MovieCard } from "@/components/streamflix/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toMovie } from "@/lib/api/wp.server";
import type { Movie } from "@/lib/types";
import { getServerConfig } from "@/lib/config.server";

interface WPGenreTerm {
  term_id: number;
  name: string;
  slug: string;
  count: number;
}

// 🟢 FIXED: Explicitly register page inside the Zod schema validator map
const exploreSearchSchema = z.object({
  q: z.string().optional().catch(""),
  page: z.number().optional().default(1).catch(1), // Added tracking rule
});

export const Route = createFileRoute("/_authenticated/explore/$genreId")({
  validateSearch: exploreSearchSchema,
  shouldReload: true, // 🟢 FORCE LOADER TO EXECUTE INSTANTLY ON ANY SEARCH PARAM MUTATION
  loader: async ({ params, location }) => {
    const genreSlug = params.genreId;
    const searchParams = new URLSearchParams(location.search);
    const fallbackName = searchParams.get('q') || "Explore";
    // Track the active pagination page from the URL string parameters (fallback to page 1)
    const activePage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1;

    const { FILMJEPANG_API_BASE_URL, FILMJEPANG_API_KEY } = getServerConfig();
    
    let genres: WPGenreTerm[] = [];
    let items: Movie[] = [];
    let totalPages = 1;
    let totalResults = 0;

    try {
      // 1. Fetch live genres from the WordPress API to populate the chips panel
      const genresRes = await fetch(`${FILMJEPANG_API_BASE_URL}/genres`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      if (genresRes.ok) {
        genres = await genresRes.json();
        genres.sort((a, b) => b.count - a.count); // Sort genres by count
        genres = genres.slice(0, 10); // Limit to top 10 genres for UI
      }

      // 2. Fetch movies belonging to this specific genre slug
      const moviesRes = await fetch(`${FILMJEPANG_API_BASE_URL}/genres/${genreSlug}?page=${activePage}&per_page=35`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      if (moviesRes.ok) {
        const wpData = await moviesRes.json();
        items = (wpData.results || []).map((m: any) => toMovie(m));
        totalPages = wpData.total_pages || 1;
        totalResults = wpData.total_results || 0;
      }
    } catch (err) {
      console.error("Explore genre slug loader error:", err);
    }

    // Resolve the exact human-readable name of the current genre matching the slug
    const matchedTerm = genres.find((g) => g.slug === genreSlug);
    const genreName = matchedTerm ? matchedTerm.name : fallbackName;

    return { genreId: genreSlug, genreName, genres, items, totalPages, totalResults, activePage };
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
  const { genreId, genreName, genres, items, totalPages, totalResults, activePage } = Route.useLoaderData();
  const navigate = useNavigate();

  const safeGenres = genres || [];
  const safeItems = items || [];
  const hero = safeItems[0];

  const visible = items || []; 
  const pageCount = totalPages; 

   // 🟢 FIXED: Clean, synchronous search parameter state mapping function
  const handlePageChange = (targetPage: number) => {
    navigate({
      to: '.', // Targets the exact active path route location
      search: (prev) => ({ 
        ...prev, 
        page: targetPage // Safely mutates tracked schema integers
      }),
    });
    
     // FIX: Encapsulate browser-only window objects in SSR-safe conditional to avoid hydration errors
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      {/* Cinematic Hero Header Viewport */}
      <section className="relative flex h-[42vh] items-end overflow-hidden sm:h-[52vh] bg-zinc-950">
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
          {safeGenres.map((g: any) => {
            const currentSlug = g.slug || g.name.toLowerCase().trim().replace(/\s+/g, '-');
            const active = currentSlug === genreId;
            
            return (
              <Link
                key={g.term_id || g.id}
                to="/explore/$genreId"
                params={{ genreId: currentSlug }} // FIX: Routes dynamically via string slugs
                search={{ q: g.name }}
                className={`rounded-full border px-4 py-2 text-sm transition font-medium shadow-sm ${
                  active
                    ? "border-white bg-white text-black font-semibold scale-105"
                    : "border-border text-muted-foreground hover:border-primary hover:text-foreground hover:bg-white/5"
                }`}
              >
                {g.name}
              </Link>
            );
          })}
        </div>

        {safeItems.length > 0 ? (
          <div className="mt-8">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {visible.map((m) => (
                <button
                  key={m.id}
                  onClick={() => navigate({ to: "/movie/$id", params: { id: m.id } })}
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
                    const maxVisible = 10;
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
