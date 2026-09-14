import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Navbar } from "@/components/streamflix/Navbar";
import { MobileBottomNav } from "@/components/streamflix/MobileBottomNav";
import { CinematicHeroCarousel } from "@/components/streamflix/CinematicHeroCarousel";
import { CinematicBanner } from "@/components/streamflix/CinematicBanner";
import { MovieListing } from "@/components/streamflix/MovieListing";
import { Footer } from "@/components/streamflix/Footer";
import { BrowseSkeleton } from "@/components/streamflix/BrowseSkeleton";
import { browseMoviesQueryOptions } from "@/lib/api/tmdb";
import { MOVIE_SORT_OPTIONS, SEO_SITE_NAME } from '@/lib/constants';

const moviesSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  sort: z.string().default(MOVIE_SORT_OPTIONS.NEW).catch(MOVIE_SORT_OPTIONS.NEW)
});

export const Route = createFileRoute("/movies/")({
  validateSearch: moviesSearchSchema,
  shouldReload: false,
  loaderDeps: ({ search: { page, sort } }) => ({ page, sort }),
  loader: async ({ params, deps: { page, sort }, context: { queryClient } }) => {
    const [movieList] = await Promise.all([
        queryClient.ensureQueryData(browseMoviesQueryOptions(page, sort)),
      ]);
    
      return {
        heroSlides: movieList?.results.slice(0, 3),
        movies: movieList?.results,
        totalPages: movieList.total_pages,
        totalResults: movieList.total_results,
        activePage: page,
        activeSort: sort
      };
  },
  head: () => ({ meta: [{ title: `${SEO_SITE_NAME} - Discover Japanese AV Movie Collections in HD` }] }),
  component: MoviesPage,
  pendingComponent: () => <BrowseSkeleton isHomePage={true}/>,
});


function MoviesPage() {
    const { 
       heroSlides,
       movies, 
       totalPages, 
       totalResults, 
       activePage, 
       activeSort 
     } = Route.useLoaderData();
  return (
    <>
      {movies && movies.length > 0 ? (
        <CinematicHeroCarousel slides={heroSlides} />
      ) :(
        <CinematicBanner
            themeColor="red"
            title="Browse Movies"
            totalCount={0}
            countLabelSingular="movie"
            countLabelPlural="movies"
          />
      )}
      <MovieListing
          movies={movies}
          activePage={activePage}
          totalPages={totalPages}
          totalResults={totalResults}
          activeSort={activeSort}
          searchQuery=""
        />
    </>
  );
}
