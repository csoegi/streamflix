import { z } from "zod";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search as SearchIcon, X, User,Film} from "lucide-react";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { PAGED_LIST_SIZE, MOVIE_SORT_OPTIONS, CACHE_TTL } from "@/lib/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchActors, searchKeyword } from "@/lib/api/tmdb";
import { MovieListing } from "@/components/streamflix/MovieListing";
import { MovieList, WPTerm } from "@/lib/types";

type Tab = "titles" | "people";

const searchSchema = z.object({
  q: z.string().optional().catch(""),
  tab: z.enum(["titles", "people"]).optional().catch("titles"),
  page: z.number().default(1).catch(1),
  sort: z.string().default(MOVIE_SORT_OPTIONS.NEW).catch(MOVIE_SORT_OPTIONS.NEW)
});

export const Route = createFileRoute("/search")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Film Jepang - Search Movie Collection" }] }),
  component: SearchPage,
});

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SearchPage() {
  const currentSearch = useSearch({ from: "/search" });
  const {
    q: activeQuery,
    tab: activeTab = "titles",
    page: activePage = 1,     
    sort: activeSort = MOVIE_SORT_OPTIONS.NEW,
  } = currentSearch;

  // 1. 🟢 Keep ONLY 'q' in local state so the input text box remains fluid while typing
  const [q, setQ] = useState(activeQuery ?? "");
  const debouncedQ = useDebounce(q, 300);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasFilters = Boolean(activeSort);
  const canSearch = debouncedQ.length >= 2 || hasFilters;

  // 2. 🟢 Sync changes to the search query 'q' into the URL seamlessly
  useEffect(() => {
    navigate({
      to: "/search",
      search: (prev) => ({ 
        ...prev, 
        q: debouncedQ || undefined,
        page: 1 // Reset pagination window back to page 1 whenever the query changes
      }),
      replace: true, 
    });
  }, [debouncedQ, navigate]);

  const titlesQuery = useQuery({
    queryKey: ["search_titles", debouncedQ, activePage, activeSort],
    queryFn: async () => {
      return await searchKeyword({
          data: {
            q: debouncedQ,
            page: activePage, // Now reacts to real-time page turns correctly
            per_page: PAGED_LIST_SIZE.GRID,
            sort: activeSort, // Now reacts to sort changes correctly
          },
        }) as MovieList;
    },
    enabled: activeTab === "titles" && canSearch,
    staleTime: CACHE_TTL.MOVIES, 
  });

  const peopleQuery = useQuery({
    queryKey: ["search_peoples", debouncedQ],
    queryFn: async () => {
      const actors = await searchActors({ data: { actorName: debouncedQ } }) as WPTerm[];
      return actors || [];
    },
    enabled: activeTab === "people" && debouncedQ.length >= 2,
    staleTime: CACHE_TTL.MOVIES,
  });

  const movieList = titlesQuery.data;
  const movieTotalPages = movieList?.total_pages || 0;
  const movieTotalResult = movieList?.total_results || 0;
  const movies = movieList?.results || [];
  const people = peopleQuery.data || [];
  const loading = titlesQuery.isFetching || peopleQuery.isFetching;

  // 4. 🟢 Core Action handlers passed straight into your navigation nodes
  const handleTabChange = (newTab: Tab) => {
    navigate({
      to: "/search",
      search: (prev) => ({ ...prev, tab: newTab, page: 1 })
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 px-4 pt-24 pb-16 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles or people…"
              aria-label="Search titles or people"
              className="w-full rounded-full border border-border bg-zinc-900 pl-12 pr-12 py-3.5 sm:py-4 text-base sm:text-lg focus:border-primary focus:outline-none"
            />
            {q && (
              <button
                onClick={() => setQ("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
                aria-label="Clear"
              >
                <X className="size-5" />
              </button>
            )}
          </div>

          <div className="mt-4 flex gap-2 border-b border-border overflow-x-auto">
            {(["titles", "people"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => handleTabChange(t)} // 🟢 Use the updated URL navigator handler
                className={`flex items-center gap-1.5 px-4 py-2.5 sm:py-2 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                {t === "titles" && <Film className="size-4" />}
                {t === "people" && <User className="size-4" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Context Render Section Grid */}
        <section className="mx-auto w-full max-w-[1800px] mt-6">
          {loading && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {Array.from({ length: 14 }).map((_, i) => (
                <Skeleton key={i} className="w-full aspect-[2/3] rounded-xl" />
              ))}
            </div>
          )}          

          {!loading && activeTab === "titles" && (debouncedQ || hasFilters) && (
            <MovieListing
              movies={movies}
              activePage={activePage}
              totalPages={movieTotalPages}
              totalResults={movieTotalResult}
              activeSort={activeSort}
              searchQuery={debouncedQ}
            />
          )}

          {!loading && activeTab === "people" && (
            <div>
              {debouncedQ.length < 2 ? (
                <p className="text-sm text-muted-foreground text-center py-12">
                  Type an actor name above
                </p>
              ) : people.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-12">No matching people profiles found</p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-w-4xl mx-auto">
                  {people.map((p: WPTerm) => (
                    <Link
                      key={p.term_id}
                      to="/collections/actresses/$actorSlug"
                      params={{ actorSlug: p.slug }}
                      className="flex items-center gap-4 rounded-lg border border-border bg-zinc-900 p-3 hover:ring-1 hover:ring-primary transition"
                    >
                      <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground shrink-0">
                        <User className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">{p.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
