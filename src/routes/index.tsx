import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/streamflix/Navbar";
import { CinematicHeroCarousel } from "@/components/streamflix/CinematicHeroCarousel";
import { Link } from "@tanstack/react-router";
import { Row } from "@/components/streamflix/Row";
import { MovieCard } from "@/components/streamflix/MovieCard";
import { Footer } from "@/components/streamflix/Footer";
import { BrowseSkeleton } from "@/components/streamflix/BrowseSkeleton";
import { SEO_SITE_NAME, MOVIE_SORT_OPTIONS } from "@/lib/constants";
import { newMoviesQueryOptions, hotMoviesQueryOptions, trendingMoviesQueryOptions, popularMoviesQueryOptions, topRatedMoviesQueryOptions, mostViewedMoviesQueryOptions } from "@/lib/api/tmdb";
import type { Movie } from "@/lib/types";

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    const [newMovies, hotMovies, trendingMovies, popularMovies, topRatedMovies, mostViewedMovies] = await Promise.all([
        queryClient.ensureQueryData(newMoviesQueryOptions()),
        queryClient.ensureQueryData(hotMoviesQueryOptions()),
        queryClient.ensureQueryData(trendingMoviesQueryOptions()),
        queryClient.ensureQueryData(popularMoviesQueryOptions()),
        queryClient.ensureQueryData(topRatedMoviesQueryOptions()),
        queryClient.ensureQueryData(mostViewedMoviesQueryOptions()),
      ]);
    
      return {
        heroSlides: hotMovies?.results.slice(0, 3),
        top10Today: hotMovies?.results,
        top10TrendingWeek: trendingMovies?.results,
        rows: [
          { title: "New Releases", sort: MOVIE_SORT_OPTIONS.NEW, items: newMovies?.results },
          { title: "Popular", sort: MOVIE_SORT_OPTIONS.POPULAR, items: popularMovies?.results },
          { title: "Most Viewed", sort: MOVIE_SORT_OPTIONS.MOST_VIEWED, items: mostViewedMovies?.results },          
          { title: "Top Rated", sort: MOVIE_SORT_OPTIONS.TOP_RATED, items: topRatedMovies?.results },
        ],
      };
  },
  head: () => ({ meta: [{ title: `${SEO_SITE_NAME} - Watch Free JAV & Japanese AV Movie Collections in HD` }] }),
  component: HomePage,
  pendingComponent: () => <BrowseSkeleton isHomePage={true}/>,
});

function HomePage() {
  const data = Route.useLoaderData();
  const heroSlides: Movie[] = data.heroSlides;  
  const top10Today: Movie[] = data.top10Today;
  const top10TrendingWeek: Movie[] = data.top10TrendingWeek;
  const rows: { title: string; sort: string, items: Movie[] }[] = data.rows;
  const [top10Ref, setTop10Ref] = useState<HTMLDivElement | null>(null);
  const [top10Scroll, setTop10Scroll] = useState({ left: 0, viewport: 0, width: 0 });
  const [trendingWeekRef, setTrendingWeekRef] = useState<HTMLDivElement | null>(null);
  const [trendingWeekScroll, setTrendingWeekScroll] = useState({ left: 0, viewport: 0, width: 0 });

  useEffect(() => {
    const el = top10Ref;
    if (!el) return;
    const measure = () =>
      setTop10Scroll({ left: el.scrollLeft, viewport: el.clientWidth, width: el.scrollWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const onScroll = () =>
      setTop10Scroll({ left: el.scrollLeft, viewport: el.clientWidth, width: el.scrollWidth });
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [top10Ref, top10Today.length]);

  useEffect(() => {
    const el = trendingWeekRef;
    if (!el) return;
    const measure = () =>
      setTrendingWeekScroll({ left: el.scrollLeft, viewport: el.clientWidth, width: el.scrollWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const onScroll = () =>
      setTrendingWeekScroll({ left: el.scrollLeft, viewport: el.clientWidth, width: el.scrollWidth });
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [trendingWeekRef, top10TrendingWeek.length]);

  const scrollTop10 = (dir: 1 | -1) => {
    if (!top10Ref) return;
    top10Ref.scrollBy({ left: dir * (top10Ref.clientWidth * 0.9), behavior: "smooth" });
  };

  const scrollTrendingWeek = (dir: 1 | -1) => {
    if (!trendingWeekRef) return;
    trendingWeekRef.scrollBy({ left: dir * (trendingWeekRef.clientWidth * 0.9), behavior: "smooth" });
  };

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <CinematicHeroCarousel slides={heroSlides} />
      <div className="relative z-10 mt-0 md:mt-12 space-y-6 md:space-y-12">
        {top10Today.length > 0 && (
          <section className="space-y-4 py-4">
            <div className="flex items-end justify-between px-4 sm:px-8 mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Trending Today
              </h2>
              <Link 
                to="/movies"
                search={{ page: 1, sort: MOVIE_SORT_OPTIONS.HOT }}
                className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View More 
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="relative">
              {top10Scroll.left > 2 && (
                <button
                  type="button"
                  onClick={() => scrollTop10(-1)}
                  aria-label="Scroll top 10 left"
                  className="absolute left-1 sm:left-2 top-1/2 z-30 hidden size-10 -translate-y-1/2 place-items-center rounded-md border border-border bg-background/90 text-foreground shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground sm:grid"
                >
                  <ChevronLeft className="size-5" />
                </button>
              )}
              {top10Scroll.viewport > 0 &&
                top10Scroll.left + top10Scroll.viewport < top10Scroll.width - 2 && (
                <button
                  type="button"
                  onClick={() => scrollTop10(1)}
                  aria-label="Scroll top 10 right"
                  className="absolute right-1 sm:right-2 top-1/2 z-30 hidden size-10 -translate-y-1/2 place-items-center rounded-md border border-border bg-background/90 text-foreground shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground sm:grid"
                >
                  <ChevronRight className="size-5" />
                </button>
              )}
              <div ref={setTop10Ref} className="scrollbar-hide flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth px-4 sm:px-8" >
                {top10Today.map((m, i) => (
                  <MovieCard key={m.id} movie={m} rank={i + 1} />
                ))}
              </div>
            </div>
          </section>
        )}
        {top10TrendingWeek.length > 0 && (
          <section className="space-y-4 py-4">
            <div className="flex items-end justify-between px-4 sm:px-8 mb-4 sm:mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Trending This Week
              </h2>
              <Link 
                to="/movies"
                search={{ page: 1, sort: MOVIE_SORT_OPTIONS.TRENDING }}
                className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                View More 
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <div className="relative">
              {trendingWeekScroll.left > 2 && (
                <button
                  type="button"
                  onClick={() => scrollTrendingWeek(-1)}
                  aria-label="Scroll trending week left"
                  className="absolute left-1 sm:left-2 top-1/2 z-30 hidden size-10 -translate-y-1/2 place-items-center rounded-md border border-border bg-background/90 text-foreground shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground sm:grid"
                >
                  <ChevronLeft className="size-5" />
                </button>
              )}
              {trendingWeekScroll.viewport > 0 &&
                trendingWeekScroll.left + trendingWeekScroll.viewport < trendingWeekScroll.width - 2 && (
                <button
                  type="button"
                  onClick={() => scrollTrendingWeek(1)}
                  aria-label="Scroll trending week right"
                  className="absolute right-1 sm:right-2 top-1/2 z-30 hidden size-10 -translate-y-1/2 place-items-center rounded-md border border-border bg-background/90 text-foreground shadow-lg backdrop-blur transition hover:bg-primary hover:text-primary-foreground sm:grid"
                >
                  <ChevronRight className="size-5" />
                </button>
              )}
              <div ref={setTrendingWeekRef} className="scrollbar-hide flex gap-3 sm:gap-5 overflow-x-auto scroll-smooth px-4 sm:px-8">
                {top10TrendingWeek.map((m, i) => (
                  <MovieCard key={m.id} movie={m} rank={i + 1} />
                ))}
              </div>
            </div>
          </section>
        )}
        {rows.map((r: { title: string; sort: string, items: Movie[] }) => (
          <Row key={r.title} title={r.title} sort={r.sort} items={r.items} />
        ))}
      </div>
      <div className="flex justify-center px-4 pb-10 pt-2">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          title="Back to top"
          className="grid size-12 place-items-center rounded-full border border-border bg-card/70 text-muted-foreground shadow-lg backdrop-blur transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 hover:border-primary hover:bg-card hover:text-foreground"
        >
          <ArrowUp className="size-5" />
        </button>
      </div>
      <Footer />
    </div>
  );
}
