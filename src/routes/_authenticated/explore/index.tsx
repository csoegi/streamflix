import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Compass, Sparkles } from "lucide-react";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { MovieCard } from "@/components/streamflix/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPopular } from "@/lib/api/tmdb";
import type { Movie } from "@/lib/types";
import { getServerConfig } from "@/lib/config.server";

// Unified definition model tracking your custom backend taxonomy schemas
interface WPGenreTerm {
  term_id: number;
  name: string;
  slug: string;
  count: number;
}

export const Route = createFileRoute("/_authenticated/explore/")({
  loader: async () => {
    const { FILMJEPANG_API_BASE_URL, FILMJEPANG_API_KEY } = getServerConfig();
    
    let genresPayload: WPGenreTerm[] = [];
    
    try {
      const res = await fetch(`${FILMJEPANG_API_BASE_URL}/genres`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        genresPayload = await res.json();
      }
    } catch (err) {
      console.error("Explore index loader taxonomy fetch failure:", err);
    }

    // 2. Fetch popular movies (this hits your tmdbFetch routing proxy layout automatically)
    const popular = await fetchPopular();
    
    return { 
      genres: genresPayload, 
      items: popular?.results || [] 
    };
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
        <div className="mt-8 flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <div className="mt-10">
          <Skeleton className="h-5 w-44 rounded" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[2/3] rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  ),
  component: ExplorePage,
});

function ExplorePage() {
  const { genres, items } = Route.useLoaderData();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const safeGenres = genres || [];
  const safeItems: Movie[] = items || [];
  const pageCount = Math.max(1, Math.ceil(safeItems.length / 24));
  const visible = safeItems.slice((page - 1) * 24, page * 24);

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />

      <section className="relative flex h-[38vh] items-end overflow-hidden sm:h-[46vh]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-700/50 via-surface to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="relative z-10 w-full px-4 pb-8 sm:px-8 md:px-16">
          <div className="flex items-center gap-2 text-purple-300">
            <Compass className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">Explore</span>
          </div>
          <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-6xl text-white">Pick a mood</h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/80 sm:text-base">
            Jump into a curated mood or genre and discover something new.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-[1800px] px-4 pb-16 sm:px-8">
        
        {/* Dynamic Genre Filter Badges Grid Array Container */}
        <div className="mt-8 flex flex-wrap gap-2">
          {safeGenres.map((g: any) => {
            // Target the clean backend text slug property natively (e.g. "action", "beautiful-girl")
            const targetGenreSlug = g.slug || g.name.toLowerCase().trim().replace(/\s+/g, '-');
            
            return (
              <Link
                key={g.term_id || g.id}
                to="/explore/$genreId"
                params={{ genreId: targetGenreSlug }} // FIX: Passes text slugs parameter to match dynamic router updates
                search={{ q: g.name }}               // Keeps target link title query tracking full string populated
                className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground hover:bg-white/5 shadow-sm"
              >
                <Sparkles className="size-3.5 text-primary" /> {g.name}
                {g.count !== undefined && (
                  <span className="text-[10px] bg-zinc-800 text-zinc-500 rounded px-1.5 py-0.5 ml-0.5 font-medium">
                    {g.count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {safeItems.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight text-white mb-4">Popular right now</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
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
        )}
      </main>
      <Footer />
    </div>
  );
}
