import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { CinematicBanner } from "@/components/streamflix/CinematicBanner";
import { TermListing } from "@/components/streamflix/TermListing";
import { TermListingSkeleton } from "@/components/streamflix/TermListingSkeleton";
import { genreTermsQueryOptions } from "@/lib/api/tmdb";

export const Route = createFileRoute("/collections/genres/")({
  shouldReload: true, // force reload to avoid cached data
  loader: async ({ context: { queryClient } }) => {
    const [genres] = await Promise.all([
        queryClient.ensureQueryData(genreTermsQueryOptions()),
    ]);
    return { terms: genres };
  },
  head: () => ({ meta: [{ title: "Explore — Genres" }] }),
  pendingComponent: TermListingSkeleton,
  component: GenresPage,
});

function GenresPage() {
  const { terms } = Route.useLoaderData();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <CinematicBanner
        themeColor="emerald"
        title="Pick a genre"
        totalCount={terms.length}
        countLabelSingular="genre"
        countLabelPlural="genres"
      />
      {/* Add the unique key prop to avoid component being cached with same data */}
      <TermListing 
        key="genres-listing-view"
        terms={terms} 
        placeholderText="Search genres..." 
        paramKeyName="genreSlug"
      />
      <Footer />
    </div>
  );
}
