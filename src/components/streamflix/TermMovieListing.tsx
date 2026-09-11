import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { MovieCard } from "@/components/streamflix/MovieCard";
import type { Movie } from "@/lib/types";
import { MovieSortOptions  } from '@/lib/constants';

export interface NavigationChip {
  term_id: number;
  name: string;
  slug: string;
}

interface TermMovieListingProps {
  movies: Movie[];
  top10Terms: NavigationChip[];
  activeTermSlug: string;
  activePage: number;
  totalPages: number;
  activeSort: string;
  paramKeyName: "genreSlug" | "actorSlug" | "studioSlug" | "codeSlug";
}

export function TermMovieListing({
  movies,
  top10Terms,
  activeTermSlug,
  activePage,
  totalPages,
  activeSort,
  paramKeyName,
}: TermMovieListingProps) {
  const navigate = useNavigate();

  // Handle pagination search mutations query segments parameter changes
  const handlePageChange = (targetPage: number) => {
    navigate({
      to: ".",
      search: (prev: any) => ({ ...prev, page: targetPage }),
    });
  };

  // Handle dynamic sorting param updates
  const handleSortChange = (targetSort: MovieSortOptions) => {
    navigate({
      to: ".",
      search: (prev: any) => ({ ...prev, sort: targetSort, page: 1 }), // Reset to page 1 on sort change
    });
  };

  return (
    <main className="mx-auto max-w-[1800px] px-4 pb-16 sm:px-8">
      
      {/* 🛠️ Top Controls Row: Navigation Chips + Sorting Selector */}
      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-zinc-800 pb-6">
        
        {/* Dynamic Navigation Chips Selection Panel row */}
        <div className="flex flex-wrap gap-2 max-w-5xl">
          {top10Terms.map((term) => {
            const currentSlug = term.slug || term.name.toLowerCase().trim().replace(/\s+/g, "-");
            const isActive = currentSlug === activeTermSlug;
            if (paramKeyName === "genreSlug") {
              return (
                <Link
                  key={term.term_id}
                  to="/collections/genres/$genreSlug"
                  params={{ genreSlug: currentSlug }}
                  search={true} // forward seearch param
                  className={`rounded-full border px-4 py-2 text-sm transition font-medium shadow-sm ${
                  isActive
                    ? "border-red-500 bg-red-600 text-white font-semibold scale-105"
                    : "border-zinc-800 text-neutral-400 bg-zinc-900/30 hover:border-red-500 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  {term.name}
                </Link>
              );
            }
            if (paramKeyName === "actorSlug") {
              return (
                <Link
                  key={term.term_id}
                  to="/collections/actresses/$actorSlug"
                  params={{ actorSlug: currentSlug }}
                  search={true} // forward seearch param
                  className={`rounded-full border px-4 py-2 text-sm transition font-medium shadow-sm ${
                  isActive
                    ? "border-red-500 bg-red-600 text-white font-semibold scale-105"
                    : "border-zinc-800 text-neutral-400 bg-zinc-900/30 hover:border-red-500 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  {term.name}
                </Link>
              );
            }
            if (paramKeyName === "studioSlug") {
              return (
                <Link
                  key={term.term_id}
                  to="/collections/studios/$studioSlug"
                  params={{ studioSlug: currentSlug }}
                  search={true} // forward seearch param
                  className={`rounded-full border px-4 py-2 text-sm transition font-medium shadow-sm ${
                  isActive
                    ? "border-red-500 bg-red-600 text-white font-semibold scale-105"
                    : "border-zinc-800 text-neutral-400 bg-zinc-900/30 hover:border-red-500 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  {term.name}
                </Link>
              );
            }
            // Fallback
            return (
              <Link
                  key={term.term_id}
                  to="/collections/series/$codeSlug"
                  params={{ codeSlug: currentSlug }}
                  search={true} // forward seearch param
                  className={`rounded-full border px-4 py-2 text-sm transition font-medium shadow-sm ${
                  isActive
                    ? "border-red-500 bg-red-600 text-white font-semibold scale-105"
                    : "border-zinc-800 text-neutral-400 bg-zinc-900/30 hover:border-red-500 hover:text-white hover:bg-zinc-800/40"
                  }`}
                >
                  {term.name.toUpperCase()}
                </Link>
            );
          })}
        </div>

        {/* 💡 Sorting Selector Element */}
        <div className="flex items-center gap-2 self-start lg:self-auto min-w-[160px]">
          <div className="relative w-full">
            <select
              value={activeSort}
              onChange={(e) => handleSortChange(e.target.value as MovieSortOptions)}
              className="appearance-none w-full h-11 bg-zinc-900/60 border border-zinc-800 rounded-lg pl-4 pr-10 text-sm font-semibold text-zinc-200 cursor-pointer focus:outline-none focus:bg-zinc-900 focus:border-zinc-700 transition"
            >                
              <option value="new">Recently Added</option>
              <option value="release_date">Release Date</option>
              <option value="hot">Hot</option>
              <option value="trending">Trending</option>
              <option value="popular">Most Viewed</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 🎬 Movies Listing Content Grid */}
      {movies.length > 0 ? (
        <div className="mt-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
            {movies.map((m: Movie) => (
              <button
                key={m.id}
                onClick={() => navigate({ to: "/movies/$id", params: { id: m.id } })}
                className="w-full text-left transition transform hover:scale-[1.02] hover:z-10 duration-200"
              >
                <MovieCard movie={m} fluid />
              </button>
            ))}
          </div>
          
          {/* 📟 Mobile-Optimized Sliding Window Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center pt-6 border-t border-zinc-900">
              <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-full">
                
                {/* Jump to FIRST Page (<<) */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={activePage === 1}
                  title="First Page"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-800 text-sm font-semibold text-neutral-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:pointer-events-none transition"
                >
                  &laquo;
                </button>

                {/* PREVIOUS Button */}
                <button
                  onClick={() => handlePageChange(Math.max(1, activePage - 1))}
                  disabled={activePage === 1}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-800 px-2.5 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:pointer-events-none transition"
                >
                  Prev
                </button>

                {/* DYNAMIC RESPONSIVE WINDOW SLIDING ENGINE */}
                {(() => {
                  // Mobile-Responsive Window Check: Show 3 slots on mobile views, expand to 5 on desktop layouts
                  const isMobileViewport = typeof window !== 'undefined' && window.innerWidth < 640;
                  const maxVisible = isMobileViewport ? 3 : 5;
                  
                  let startPage = Math.max(1, activePage - Math.floor(maxVisible / 2));
                  let endPage = startPage + maxVisible - 1;

                  if (endPage > totalPages) {
                    endPage = totalPages;
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
                          : "border border-zinc-800 text-neutral-400 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      {p}
                    </button>
                  ));
                })()}

                {/* NEXT Button */}
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, activePage + 1))}
                  disabled={activePage === totalPages}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-800 px-2.5 text-xs font-semibold text-neutral-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:pointer-events-none transition"
                >
                  Next
                </button>

                {/* Jump to LAST Page (>>) */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={activePage === totalPages}
                  title="Last Page"
                  className="inline-flex size-9 items-center justify-center rounded-lg border border-zinc-800 text-sm font-semibold text-neutral-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20 disabled:pointer-events-none transition"
                >
                  &raquo;
                </button>

              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-16 text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
          <p className="text-zinc-400 font-medium">No titles found in this view context.</p>
        </div>
      )}
    </main>
  );
}
