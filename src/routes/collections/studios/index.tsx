import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { CinematicBanner } from "@/components/streamflix/CinematicBanner";
import { TermListing } from "@/components/streamflix/TermListing";
import { TermListingSkeleton } from "@/components/streamflix/TermListingSkeleton";
import { studioTermsQueryOptions } from "@/lib/api/tmdb";
import { SEO_SITE_NAME } from "@/lib/constants";

export const Route = createFileRoute("/collections/studios/")({
  shouldReload: true, // force reload to avoid cached data
  loader: async ({ context: { queryClient } }) => {
    const [studios] = await Promise.all([
        queryClient.ensureQueryData(studioTermsQueryOptions()),
    ]);
    return { terms: studios };
  },
  head: () => ({ meta: [{  title: `${SEO_SITE_NAME} - Explore Studios` }] }),
  pendingComponent: TermListingSkeleton,
  component: StudiosPage,
});

function StudiosPage() {
  const { terms } = Route.useLoaderData();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <CinematicBanner
        themeColor="blue"
        title="Pick a studio"
        totalCount={terms.length}
        countLabelSingular="studio"
        countLabelPlural="studios"
      />
      {/* Add the unique key prop to avoid component being cached with same data */}
      <TermListing 
        key="studios-listing-view"
        terms={terms} 
        placeholderText="Search studios..." 
        paramKeyName="studioSlug"
      />
      <Footer />
    </div>
  );
}
