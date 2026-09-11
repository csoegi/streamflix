import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { CinematicBanner } from "@/components/streamflix/CinematicBanner";
import { TermListing } from "@/components/streamflix/TermListing";
import { TermListingSkeleton } from "@/components/streamflix/TermListingSkeleton";
import { serieTermsQueryOptions } from "@/lib/api/tmdb";

export const Route = createFileRoute("/collections/series/")({
  shouldReload: true, // force reload to avoid cached data
  loader: async ({ context: { queryClient } }) => {
    const [series] = await Promise.all([
        queryClient.ensureQueryData(serieTermsQueryOptions()),
    ]);
    return { terms: series };
  },
  head: () => ({ meta: [{ title: "Explore — Series" }] }),
  pendingComponent: TermListingSkeleton,
  component: SeriesPage,
});

function SeriesPage() {
  const { terms } = Route.useLoaderData();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <CinematicBanner
        themeColor="purple"
        title="Pick a serie"
        totalCount={terms.length}
        countLabelSingular="serie"
        countLabelPlural="series"
      />
      {/* Add the unique key prop to avoid component being cached with same data */}
      <TermListing 
        key="series-listing-view"
        terms={terms} 
        placeholderText="Search series..." 
        paramKeyName="codeSlug"
      />
      <Footer />
    </div>
  );
}
