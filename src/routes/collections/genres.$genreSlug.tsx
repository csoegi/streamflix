import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { TermMovieListingSkeleton } from "@/components/streamflix/TermMovieListingSkeleton";
import { CinematicHeroBanner } from "@/components/streamflix/CinematicHeroBanner";
import { TermMovieListing } from "@/components/streamflix/TermMovieListing";  
import { fetchMovieGenres, fetchMoviesByGenre } from "@/lib/api/tmdb";
import { MOVIE_SORT_OPTIONS, MovieSortOptions  } from '@/lib/constants';

export const Route = createFileRoute("/collections/genres/$genreSlug")({
  // 1. Validate search parameters first
  validateSearch: (search: Record<string, unknown>): { page: number; sort: MovieSortOptions } => {
    return {
      page: Number(search.page || 1),
      sort: (search.sort as MovieSortOptions) || MOVIE_SORT_OPTIONS.NEW,
    };
  },

  // Map explicitly verified values into your loader dependencies
  loaderDeps: ({ search: { page, sort } }) => ({ page, sort }),

  shouldReload: true,

  // 3. Keep your core data loading blocks grouped before head/component to protect type inference
  loader: async ({ params, deps: { page, sort } }) => {
    const [genres, movieList] = await Promise.all([
      fetchMovieGenres(),
      fetchMoviesByGenre({ data: { slug: params.genreSlug , page: page, sort: sort}})
    ]);
    
    return {
      genreSlug: params.genreSlug,
      genreName: genres.find(g => g.slug === params.genreSlug)?.name || "",
      top10Genres: genres.sort((a, b) => b.count - a.count).slice(0, 10),
      movies: movieList.results,
      totalPages: movieList.total_pages,
      totalResults: movieList.total_results,
      activePage: page,
      activeSort: sort
    };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `Genre - ${loaderData?.genreName}` }],
  }),
  pendingComponent: () => <TermMovieListingSkeleton chipCount={10} cardCount={14} />,
  component: ExploreGenrePage,
});

function ExploreGenrePage() {
  const { 
    genreSlug, 
    genreName, 
    top10Genres, 
    movies, 
    totalPages, 
    totalResults, 
    activePage, 
    activeSort 
  } = Route.useLoaderData();


  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <CinematicHeroBanner
        heroMovie={movies[0]} // Passes the first movie item safely as an object reference
        termName={genreName}
        totalResults={totalResults}
        vibeLabelSingular="genre"
      />
      <TermMovieListing
        movies={movies}
        top10Terms={top10Genres}
        activeTermSlug={genreSlug}
        activePage={activePage}
        totalPages={totalPages}
        activeSort={activeSort}
        chipTargetRoutePath="/collections/genres/$genreSlug"
        chipParamKeyName="genreSlug"
      />
      <Footer />
    </div>
  );
}
