import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { TermMovieListingSkeleton } from "@/components/streamflix/TermMovieListingSkeleton";
import { CinematicHeroBanner } from "@/components/streamflix/CinematicHeroBanner";
import { CinematicBanner } from "@/components/streamflix/CinematicBanner";
import { TermMovieListing } from "@/components/streamflix/TermMovieListing";  
import { actorTermsQueryOptions, moviesByActorQueryOptions } from "@/lib/api/tmdb";
import { MOVIE_SORT_OPTIONS, SEO_SITE_NAME } from '@/lib/constants';

const moviesSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  sort: z.string().default(MOVIE_SORT_OPTIONS.NEW).catch(MOVIE_SORT_OPTIONS.NEW)
});

export const Route = createFileRoute("/collections/actresses/$actorSlug")({
  validateSearch: moviesSearchSchema,
  shouldReload: false,
  loaderDeps: ({ search: { page, sort } }) => ({ page, sort }),
  
  // Get queryClient out of context directly
  loader: async ({ params, deps: { page, sort }, context: { queryClient } }) => {
    const [terms, movieList] = await Promise.all([
      queryClient.ensureQueryData(actorTermsQueryOptions()),
      queryClient.ensureQueryData(moviesByActorQueryOptions(params.actorSlug, page, sort))
    ]);
    
    return {
      slug: params.actorSlug,
      name: terms.find(g => g.slug === params.actorSlug)?.name || "",
      top10Terms: terms.sort((a, b) => b.count - a.count).slice(0, 10),
      movies: movieList.results,
      totalPages: movieList.total_pages,
      totalResults: movieList.total_results,
      activePage: page,
      activeSort: sort
    };
  },
  
  head: ({ loaderData }) => ({
    meta: [{ title: `${SEO_SITE_NAME} - Browse Movies by ${loaderData?.name}.` }],
  }),
  pendingComponent: () => <TermMovieListingSkeleton chipCount={10} cardCount={14} />,
  component: ExploreActressesPage,
});

function ExploreActressesPage() {
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
    <>
      {movies && movies.length > 0 ? (
        <CinematicHeroBanner
          heroMovie={movies[0]}
          termName={name}
          totalResults={totalResults}
          vibeLabelSingular="actress"
        />
      ) :(
        <CinematicBanner
            themeColor="emerald"
            title="Pick an actress"
            totalCount={0}
            countLabelSingular="actress"
            countLabelPlural="actresses"
          />
      )}
      <TermMovieListing
        movies={movies}
        top10Terms={top10Terms}
        activeTermSlug={slug}
        activePage={activePage}
        totalPages={totalPages}
        activeSort={activeSort}
        paramKeyName="actorSlug"
      />
    </>
  );
}
