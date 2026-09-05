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

const exploreSearchSchema = z.object({
  q: z.string().optional().catch(""),
});

export const Route = createFileRoute("/_authenticated/explore/$genreId")({
  validateSearch: exploreSearchSchema,
  loader: async ({ params, location }) => {
    const genreSlug = params.genreId;
    const searchParams = new URLSearchParams(location.search);
    const fallbackName = searchParams.get('q') || "Explore";
    
    const { FILMJEPANG_API_BASE_URL, FILMJEPANG_API_KEY } = getServerConfig();
    
    let genres: WPGenreTerm[] = [];
    let items: Movie[] = [];
    
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
      const moviesRes = await fetch(`${FILMJEPANG_API_BASE_URL}/genres/${genreSlug}?per_page=48`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      if (moviesRes.ok) {
        const wpData = await moviesRes.json();
        items = (wpData.results || []).map((m: any) => toMovie(m));
      }
    } catch (err) {
      console.error("Explore genre slug loader error:", err);
    }

    // Resolve the exact human-readable name of the current genre matching the slug
    const matchedTerm = genres.find((g) => g.slug === genreSlug);
    const genreName = matchedTerm ? matchedTerm.name : fallbackName;

    return { genreId: genreSlug, genreName, genres, items };
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
  const { genreId, genreName, genres, items } = Route.useLoaderData();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const safeGenres = genres || [];
  const safeItems = items || [];
  const hero = safeItems[0];

  const pageCount = Math.max(1, Math.ceil(safeItems.length / 24));
  const visible = safeItems.slice((page - 1) * 24, page * 24);

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
            {safeItems.length} titles hand-picked to match this vibe.
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
                onClick={() => setPage(1)}
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
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" /> Previous
                </button>
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      p === page
                        ? "bg-white text-black font-semibold shadow-md"
                        : "border border-border text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
                >
                  Next <ChevronRight className="size-4" />
                </button>
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
