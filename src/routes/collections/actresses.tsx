import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { CinematicBanner } from "@/components/streamflix/CinematicBanner";
import { TermListing } from "@/components/streamflix/TermListing";
import { TermListingSkeleton } from "@/components/streamflix/TermListingSkeleton";
import { fetchMovieActors } from "@/lib/api/tmdb";

export const Route = createFileRoute("/collections/actresses")({
  shouldReload: true, // force reload to avoid cached data
  loader: async () => {
    const [actors] = await Promise.all([fetchMovieActors()]);
    return { terms: actors };
  },
  head: () => ({ meta: [{ title: "Explore — Actresses" }] }),
  pendingComponent: TermListingSkeleton,
  component: ActressesPage,
});

function ActressesPage() {
  const { terms } = Route.useLoaderData();

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
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
        targetRoutePath="/collections/actresses/$actorSlug"
        paramKeyName="actorSlug"
      />
      <Footer />
    </div>
  );
}
