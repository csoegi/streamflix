import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ChevronDown } from "lucide-react";
import { MOVIE_SORT_OPTIONS } from "@/lib/constants";

export interface WPTerm {
  term_id: number;
  name: string;
  slug: string;
  count: number;
}

type SortOption = "videos" | "alpha";

interface TermListingProps {
  terms: WPTerm[];
  placeholderText?: string;
  paramKeyName: "genreSlug" | "actorSlug" | "studioSlug" | "codeSlug";
}

export function TermListing({ 
  terms, 
  placeholderText = "Search...", 
  paramKeyName 
}: TermListingProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("alpha");

  // Local processing pipeline (Search filtering + Sorting actions)
  const processedTerms = useMemo(() => {
    let list = [...terms];

    // 1. Handle String Filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }

    // 2. Handle List Sorting Rules
    if (sortBy === "videos") {
      list.sort((a, b) => (b.count || 0) - (a.count || 0));
    } else if (sortBy === "alpha") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [terms, searchQuery, sortBy]);

  return (
    <main className="mx-auto max-w-[1800px] px-4 pb-16 sm:px-8">        
      {/* Controls Layout Layer */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-6">

        {/* Functional Search Bar Wrapper Input */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder={placeholderText}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 bg-zinc-900/60 border border-zinc-800 rounded-lg pl-10 pr-4 text-sm font-medium placeholder-zinc-500 text-zinc-100 transition focus:outline-none focus:border-zinc-700 focus:bg-zinc-900"
          />
        </div>

        {/* Filtering Dropdown Select Container */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none h-11 bg-zinc-900/60 border border-zinc-800 rounded-lg pl-4 pr-10 text-sm font-semibold text-zinc-200 cursor-pointer focus:outline-none focus:bg-zinc-900 focus:border-zinc-700 transition"
            >                
              <option value="alpha">Name (A-Z)</option>
              <option value="videos">Most movies</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid Display Layout */}
      {processedTerms.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {processedTerms.map((item) => {
            const cleanSlug = item.slug || item.name.toLowerCase().trim().replace(/\s+/g, '-'); 
            if (paramKeyName === "genreSlug") {
              return (
                <Link
                  key={item.term_id}
                  to="/collections/genres/$genreSlug"
                  params={{ genreSlug: cleanSlug }}
                  className="flex items-center justify-between h-14 bg-zinc-900/30 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-red-500 hover:bg-zinc-800/40 group shadow-sm"
                >
                  <span className="truncate group-hover:text-white transition duration-150">{item.name}</span>
                  <span className="text-xs text-zinc-500 font-mono tracking-tight bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/60">{item.count}</span>
                </Link>
              );
            }
            if (paramKeyName === "actorSlug") {
              return (
                <Link
                  key={item.term_id}
                  to="/collections/actresses/$actorSlug"
                  params={{ actorSlug: cleanSlug }}
                  className="flex items-center justify-between h-14 bg-zinc-900/30 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-red-500 hover:bg-zinc-800/40 group shadow-sm"
                >
                  <span className="truncate group-hover:text-white transition duration-150">{item.name}</span>
                  <span className="text-xs text-zinc-500 font-mono tracking-tight bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/60">{item.count}</span>
                </Link>
              );
            }
            if (paramKeyName === "studioSlug") {
              return (
                <Link
                  key={item.term_id}
                  to="/collections/studios/$studioSlug"
                  params={{ studioSlug: cleanSlug }}
                  className="flex items-center justify-between h-14 bg-zinc-900/30 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-red-500 hover:bg-zinc-800/40 group shadow-sm"
                >
                  <span className="truncate group-hover:text-white transition duration-150">{item.name}</span>
                  <span className="text-xs text-zinc-500 font-mono tracking-tight bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/60">{item.count}</span>
                </Link>
              );
            }
            // Fallback
            return (
              <Link
                key={item.term_id}
                to="/collections/series/$codeSlug"
                params={{ codeSlug: cleanSlug }}
                className="flex items-center justify-between h-14 bg-zinc-900/30 border border-zinc-800/80 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-red-500 hover:bg-zinc-800/40 group shadow-sm"
              >
                <span className="truncate group-hover:text-white transition duration-150">{item.name.toUpperCase()}</span>
                <span className="text-xs text-zinc-500 font-mono tracking-tight bg-zinc-900/80 px-2 py-0.5 rounded border border-zinc-800/60">{item.count}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State Fallback */
        <div className="mt-16 text-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
          <p className="text-zinc-400 font-medium">No records found matching "{searchQuery}"</p>
          <button 
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs text-red-500 font-semibold hover:underline"
          >
            Clear search filter
          </button>
        </div>
      )}
    </main>
  );
}
