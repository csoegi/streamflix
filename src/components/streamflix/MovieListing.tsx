import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { MovieCard } from "@/components/streamflix/MovieCard";
import type { Movie } from "@/lib/types";
import { MovieSortOptions  } from '@/lib/constants';

interface MovieListingProps {
  movies: Movie[];
  activePage: number;
  activeSort: string;  
  totalPages: number;
}

export function MovieListing({
  movies,
  activePage,
  activeSort,
  totalPages,
}: MovieListingProps) {
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
    <div className="w-full px-4 pb-16 sm:px-6 lg:px-8"> 
      
      {/* 🛠️ Top Controls Row: Navigation Chips + Sorting Selector */}
      <div className="mt-8 flex items-center justify-between border-b border-zinc-800 pb-6 w-full">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
          Browse Movies
        </h1>       
                
        {/* 💡 Sorting Selector Element */}
        <div className="flex items-center gap-2 min-w-[160px] justify-end ml-auto">
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
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 w-full">
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
                      className={`rounded-md px-3 py-2 text-sm transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 ${
                        p === activePage
                          ? "bg-primary text-primary-foreground scale-105"
                          : "border border-border text-muted-foreground hover:text-foreground"
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
          <p className="text-zinc-400 font-medium">No movie found for this collection.</p>
        </div>
      )}
    </div>
  );
}
