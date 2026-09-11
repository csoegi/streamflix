import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { TermMovieListingSkeleton } from "@/components/streamflix/TermMovieListingSkeleton";
import { CinematicHeroBanner } from "@/components/streamflix/CinematicHeroBanner";
import { CinematicBanner } from "@/components/streamflix/CinematicBanner";
import { TermMovieListing } from "@/components/streamflix/TermMovieListing";  
import { genreTermsQueryOptions, moviesByGenreQueryOptions } from "@/lib/api/tmdb";
import { MOVIE_SORT_OPTIONS, SEO_SITE_NAME } from '@/lib/constants';

const moviesSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  sort: z.string().default(MOVIE_SORT_OPTIONS.NEW).catch(MOVIE_SORT_OPTIONS.NEW)
});

export const Route = createFileRoute("/collections/genres/$genreSlug")({
  validateSearch: moviesSearchSchema,
  shouldReload: false,
  loaderDeps: ({ search: { page, sort } }) => ({ page, sort }),
  
  // Get queryClient out of context directly
  loader: async ({ params, deps: { page, sort }, context: { queryClient } }) => {
    const [terms, movieList] = await Promise.all([
      queryClient.ensureQueryData(genreTermsQueryOptions()),
      queryClient.ensureQueryData(moviesByGenreQueryOptions(params.genreSlug, page, sort))
    ]);
    
    return {
      slug: params.genreSlug,
      name: terms.find(g => g.slug === params.genreSlug)?.name || "",
      top10Terms: terms.sort((a, b) => b.count - a.count).slice(0, 10),
      movies: movieList.results,
      totalPages: movieList.total_pages,
      totalResults: movieList.total_results,
      activePage: page,
      activeSort: sort
    };
  },
  
  head: ({ loaderData }) => ({
    meta: [{ title: `${SEO_SITE_NAME} - Watch ${loaderData?.name} Genre.` }],
  }),
  pendingComponent: () => <TermMovieListingSkeleton chipCount={10} cardCount={14} />,
  component: ExploreGenresPage,
});

function ExploreGenresPage() {
  // Component code remains clean and unchanged!
  const { 
    slug, 
    name, 
    top10Terms, 
    movies, 
    totalPages, 
    totalResults, 
    activePage, 
    activeSort 
  } = Route.useLoaderData();
  
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      {movies && movies.length > 0 ? (
        <CinematicHeroBanner
          heroMovie={movies[0]}
          termName={name}
          totalResults={totalResults}
          vibeLabelSingular="genre"
        />
      ) :(
        <CinematicBanner
            themeColor="emerald"
            title="Pick a genre"
            totalCount={0}
            countLabelSingular="genre"
            countLabelPlural="genres"
          />
      )}
      <TermMovieListing
        movies={movies}
        top10Terms={top10Terms}
        activeTermSlug={slug}
        activePage={activePage}
        totalPages={totalPages}
        activeSort={activeSort}
        paramKeyName="genreSlug"
      />
      <Footer />
    </div>
  );
}
