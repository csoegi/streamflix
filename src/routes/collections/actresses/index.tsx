import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { CinematicBanner } from "@/components/streamflix/CinematicBanner";
import { TermListing } from "@/components/streamflix/TermListing";
import { TermListingSkeleton } from "@/components/streamflix/TermListingSkeleton";
import { actorTermsQueryOptions } from "@/lib/api/tmdb";
import { SEO_SITE_NAME } from "@/lib/constants";

export const Route = createFileRoute("/collections/actresses/")({
  shouldReload: true, // force reload to avoid cached data
  loader: async ({ context: { queryClient } }) => {
    const [actors] = await Promise.all([
        queryClient.ensureQueryData(actorTermsQueryOptions()),
    ]);
    return { terms: actors };
  },
  head: () => ({ meta: [{ title: `${SEO_SITE_NAME} - Explore Actresses` }] }),
  pendingComponent: TermListingSkeleton,
  component: ActressesPage,
});

function ActressesPage() {
  const { terms } = Route.useLoaderData();

  return (
   <>
      <CinematicBanner
        themeColor="rose"
        title="Pick an actress"
        totalCount={terms.length}
        countLabelSingular="actress"
        countLabelPlural="actresses"
      />
      {/* Add the unique key prop to avoid component being cached with same data */}
      <TermListing 
        key="actresses-listing-view"
        terms={terms} 
        placeholderText="Search actresses..." 
        paramKeyName="actorSlug"
      />
    </>
  );
}
