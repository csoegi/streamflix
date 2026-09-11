import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { TermMovieListingSkeleton } from "@/components/streamflix/TermMovieListingSkeleton";
import { CinematicHeroBanner } from "@/components/streamflix/CinematicHeroBanner";
import { CinematicBanner } from "@/components/streamflix/CinematicBanner";
import { TermMovieListing } from "@/components/streamflix/TermMovieListing";  
import { studioTermsQueryOptions, moviesByStudioQueryOptions } from "@/lib/api/tmdb";
import { MOVIE_SORT_OPTIONS, SEO_SITE_NAME } from '@/lib/constants';

const moviesSearchSchema = z.object({
  page: z.number().default(1).catch(1),
  sort: z.string().default(MOVIE_SORT_OPTIONS.NEW).catch(MOVIE_SORT_OPTIONS.NEW)
});

export const Route = createFileRoute("/collections/studios/$studioSlug")({
  validateSearch: moviesSearchSchema,
  shouldReload: false,
  loaderDeps: ({ search: { page, sort } }) => ({ page, sort }),
  
  // Get queryClient out of context directly
  loader: async ({ params, deps: { page, sort }, context: { queryClient } }) => {
    const [terms, movieList] = await Promise.all([
      queryClient.ensureQueryData(studioTermsQueryOptions()),
      queryClient.ensureQueryData(moviesByStudioQueryOptions(params.studioSlug, page, sort))
    ]);
    
    return {
      slug: params.studioSlug,
      name: terms.find(g => g.slug === params.studioSlug)?.name || "",
      top10Terms: terms.sort((a, b) => b.count - a.count).slice(0, 10),
      movies: movieList.results,
      totalPages: movieList.total_pages,
      totalResults: movieList.total_results,
      activePage: page,
      activeSort: sort
    };
  },
  
  head: ({ loaderData }) => ({
    meta: [{ title: `${SEO_SITE_NAME} - Watch Movies by ${loaderData?.name} Studio.` }],
  }),
  pendingComponent: () => <TermMovieListingSkeleton chipCount={10} cardCount={14} />,
  component: ExploreStudioPage,
});

function ExploreStudioPage() {
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
          vibeLabelSingular="studio"
        />
      ) :(
        <CinematicBanner
            themeColor="emerald"
            title="Pick a studio"
            totalCount={0}
            countLabelSingular="studio"
            countLabelPlural="studios"
          />
      )}
      <TermMovieListing
        movies={movies}
        top10Terms={top10Terms}
        activeTermSlug={slug}
        activePage={activePage}
        totalPages={totalPages}
        activeSort={activeSort}
        paramKeyName="studioSlug"
      />
      <Footer />
    </div>
  );
}
