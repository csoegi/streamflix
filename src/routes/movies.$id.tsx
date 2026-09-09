import {
  createFileRoute,
  Link,
  notFound,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Play,
  Share2,
  Clapperboard,
  ArrowLeft,
  ShieldOff,
  Check,
  Bookmark,
  Star,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  isKidsProfile,
  isRatingBlockedForKids,
  isGenreBlockedForKids,
  filterKidsContent,
} from "@/lib/kids-mode";
import { toast } from "sonner";
import { shareContent } from "@/lib/share";
import { buildTitleLogoUrl } from "@/lib/title-logo";
import { seoMetaFor, siteUrl } from "@/lib/seo";
import { stepsToUsefulBackTarget } from "@/lib/nav-history";
import { getWatchHistory, markAsWatched, unmarkWatched } from "@/lib/continue-watching";
import { isInMyList, toggleMyList } from "@/lib/my-list";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { Row } from "@/components/streamflix/Row";
import { Skeleton } from "@/components/ui/skeleton";
import { movieById, loadSimilar, loadRecommendations, getWatchProviders, type WatchProvider } from "@/lib/streamflix-data";
import { discoverByGenre, fetchTitleLogo } from "@/lib/api/tmdb";
import { SeasonEpisodePicker } from "@/components/streamflix/SeasonEpisodePicker";
import { TrailerModal } from "@/components/streamflix/TrailerModal";
import { AgeRatingBadge } from "@/components/streamflix/AgeRatingBadge";

function MovieSkeleton() {
  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <section className="relative min-h-[70vh] pt-16 md:min-h-[85vh] md:pt-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[52vh] overflow-hidden sm:h-[58vh] md:inset-y-0 md:h-auto">
          <Skeleton className="absolute inset-0 size-full rounded-none bg-surface/60" />
        </div>
        <div className="relative z-10 w-full min-w-0 px-4 py-10 sm:px-8 md:px-12 md:py-16 lg:px-16">
          <Skeleton className="mb-6 h-9 w-24 rounded-full" />
          <div className="grid w-full min-w-0 gap-10 md:grid-cols-3 md:items-center md:gap-8">
            <div className="min-w-0 space-y-4 md:col-span-2">
              <Skeleton className="mb-4 h-16 w-72 max-w-full rounded-md sm:h-20 md:h-24 md:w-80" />
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-20 rounded-full sm:h-8 sm:w-24" />
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))}
              </div>
              <div className="min-w-0">
                <Skeleton className="h-4 w-full max-w-xl rounded sm:h-5" />
                <Skeleton className="mt-2 h-4 w-full max-w-xl rounded sm:h-5" />
                <Skeleton className="mt-2 h-4 w-2/3 max-w-xl rounded sm:h-5" />
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:gap-3">
                <Skeleton className="h-10 w-24 rounded-md sm:h-12 sm:w-28" />
                <Skeleton className="h-10 w-24 rounded-md sm:h-12 sm:w-32" />
                <Skeleton className="h-10 w-24 rounded-md sm:h-12 sm:w-28" />
                <Skeleton className="size-11 rounded-full sm:size-12" />
                <Skeleton className="size-11 rounded-full sm:size-12" />
              </div>
              <div className="min-w-0 pt-4">
                <Skeleton className="mb-3 h-5 w-16 rounded" />
                <div className="flex gap-3 overflow-hidden py-2">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton key={i} className="w-20 shrink-0 aspect-square rounded-xl sm:w-24" />
                  ))}
                </div>
              </div>
            </div>
            <div className="hidden min-w-0 md:col-span-1 md:block">
              <Skeleton className="w-full max-w-80 aspect-[2/3] rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export const Route = createFileRoute("/movies/$id")({
  loader: async ({ params }) => {
    const extraGenres = ["jav", "film-jepang-trending", "film-bokep-tidak-sensor", "jav-populer"];
    const [movie, similar, recommendations, logo, ...genreResults] = await Promise.all([
      movieById(params.id),
      loadSimilar(params.id),
      loadRecommendations(params.id),
      fetchTitleLogo({ data: { id: params.id } }).catch(() => null),
      ...extraGenres.map((g) => discoverByGenre({ data: { genreId: g } })),
    ]);
    if (!movie) throw notFound();
    const genreRows = extraGenres.map((g, i) => ({
      genreId: g,
      items: (genreResults[i] || []).filter((m: any) => m.id !== params.id).slice(0, 12),
    }));
    return { movie, similar, genreRows, recommendations, logo };
  },
  head: ({ loaderData }) => {
    const movie = loaderData?.movie;
    const title = movie ? `${movie.title} (${movie.year}) — StreamFlix` : "Movie — StreamFlix";
    const description = movie?.description
      ? `${movie.description.slice(0, 200)}`
      : "Watch movies and TV shows on StreamFlix.";
    const image = movie?.backdropSm || movie?.poster || "";
    const site = siteUrl();
    const url = site ? `${site}/movie/${movie?.id ?? ""}` : "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(movie && movie.genres.length
          ? [{ name: "keywords", content: movie.genres.join(", ") }]
          : []),
        ...seoMetaFor(
          title,
          description,
          image,
          movie?.id?.startsWith("tv-") ? "video.tv_show" : "video.movie",
          url,
        ),
      ],
      links: [...(url ? [{ rel: "canonical", href: url }] : [])],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-dvh place-items-center bg-background">
      <p className="text-muted-foreground">Title not found.</p>
    </div>
  ),
  errorComponent: () => (
    <div className="grid min-h-dvh place-items-center bg-background">
      <p className="text-muted-foreground">Something went wrong.</p>
    </div>
  ),
  component: MoviePage,
  pendingComponent: MovieSkeleton,
});

function MoviePage() {
  const { movie, similar, genreRows, recommendations, logo } = Route.useLoaderData();
  const genreLabels: Record<string, string> = {
    "jav": "JAV",
    "film-jepang-trending": "Trending",
    "jav-populer": "Popular",
    "film-bokep-tidak-sensor": "Uncensored"
  };
  const isTv = movie.id.startsWith("tv-");
  const titleLogoUrl = logo?.filePath ? buildTitleLogoUrl(logo.filePath) : null;
  const [descExpanded, setDescExpanded] = useState(false);
  const castScrollerRef = useRef<HTMLDivElement | null>(null);
  const [showPicker, setShowPicker] = useState(true);
  const [castScroll, setCastScroll] = useState({ left: 0, viewport: 0, width: 0 });

  useEffect(() => {
    const el = castScrollerRef.current;
    if (!el) return;
    const measure = () =>
      setCastScroll({ left: el.scrollLeft, viewport: el.clientWidth, width: el.scrollWidth });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const onScroll = () =>
      setCastScroll({ left: el.scrollLeft, viewport: el.clientWidth, width: el.scrollWidth });
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [movie.id]);

  const [trailerOpen, setTrailerOpen] = useState(false);

  const [inList, setInList] = useState(false);
  const [watched, setWatched] = useState(false);
  const [offers, setOffers] = useState<WatchProvider[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [showAllOffers, setShowAllOffers] = useState(false);

  useEffect(() => {
    setInList(isInMyList(movie.id));
    setWatched(getWatchHistory().some((x) => x.id === movie.id || x.id.startsWith(`${movie.id}:`)));
  }, [movie.id]);

  // Fetch TMDB watch providers
  useEffect(() => {
    let cancelled = false;
    setOffersLoading(true);
    getWatchProviders(movie.id, isTv ? "tv" : "movie")
      .then((results: Record<string, { link: string; flatrate?: WatchProvider[]; rent?: WatchProvider[]; buy?: WatchProvider[]; free?: WatchProvider[]; ads?: WatchProvider[] }>) => {
        if (!cancelled) {
          // Flatten providers from all countries, prefer US
          const allProviders: WatchProvider[] = [];
          const countries = Object.keys(results).sort((a, b) => a === "US" ? -1 : b === "US" ? 1 : 0);
          for (const country of countries) {
            const r = results[country];
            if (r.flatrate) allProviders.push(...r.flatrate);
            if (r.rent) allProviders.push(...r.rent);
            if (r.buy) allProviders.push(...r.buy);
            if (r.free) allProviders.push(...r.free);
            if (r.ads) allProviders.push(...r.ads);
          }
          // Deduplicate by provider_id
          const byProvider = new Map<number, WatchProvider>();
          for (const p of allProviders) {
            if (!byProvider.has(p.provider_id)) {
              byProvider.set(p.provider_id, p);
            }
          }
          setOffers(Array.from(byProvider.values()));
        }
      })
      .finally(() => {
        if (!cancelled) setOffersLoading(false);
      });
    return () => { cancelled = true; };
  }, [movie.id, isTv]);

  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
  const goBack = () => {
    const steps = stepsToUsefulBackTarget(location.pathname, [`/watch/${movie.id}`]);
    if (steps !== null) {
      router.history.go(-steps);
    } else {
      navigate({ to: "/browse" });
    }
  };

  const scrollCast = (dir: 1 | -1) => {
    const el = castScrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (7 * 104), behavior: "smooth" });
  };

  const kidsMode = useMemo(() => isKidsProfile(), []);  const blocked =
    kidsMode &&
    (isRatingBlockedForKids(movie.rating) || isGenreBlockedForKids(movie.genreIds ?? []));
  const filteredSimilar = kidsMode ? filterKidsContent(similar) : similar;
  const filteredRecommendations = kidsMode ? filterKidsContent(recommendations) : recommendations;
  const filteredGenreRows = kidsMode
    ? genreRows
        .filter((gr) => filterKidsContent(gr.items).length > 0)
        .map((gr) => ({ ...gr, items: filterKidsContent(gr.items) }))
    : genreRows;

  if (blocked) {
    return (
      <div className="min-h-dvh bg-background">
        <Navbar />
        <div className="grid min-h-[70vh] place-items-center gap-4 px-4">
          <div className="grid size-24 place-items-center rounded-full bg-amber-500/15">
            <ShieldOff className="size-12 text-amber-400" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              Content not available for kids
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              This title isn't suitable for kids profiles. Try switching to a regular profile to
              watch it.
            </p>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
          <section className="relative pt-16 md:flex md:min-h-[85vh] md:items-center md:pt-20 bg-background overflow-hidden">
        
        {/* LAYER 1: Ambient Blurred Background (Brings portrait artwork out to widescreen sides) 
            blur-sm | blur |blur-md | blur-lg | blur-xl| blur-3xl
        */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[52vh] overflow-hidden sm:h-[58vh] md:inset-y-0 md:h-auto md:w-full select-none scale-110 transform z-0">
          <img 
            src={movie.backdrop} 
            alt="" 
            className="absolute inset-0 size-full object-cover blur-lg opacity-70 brightness-70" 
          />
        </div>

        {/* LAYER 2: Crisp Foreground Portrait Poster (Preserves real 360x510 proportions in right grid column) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[52vh] overflow-hidden sm:h-[58vh] md:inset-y-0 md:h-auto md:w-full select-none z-10 flex items-center justify-end pr-0 md:pr-16 lg:pr-32 opacity-80 md:opacity-90">
          <img 
            src={movie.poster} 
            alt="" 
            className="h-[75%] w-auto object-contain rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/5 hidden md:block" 
          />
        </div>

        {/* LAYER 3: Combined Shader Gradients Masks Overlays */}
        <div className="absolute inset-x-0 top-0 h-[52vh] bg-gradient-to-r from-background via-background/60 to-transparent z-15 pointer-events-none md:inset-y-0 md:h-auto md:w-full md:bg-gradient-to-r md:from-background md:via-background/50 md:to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[52vh] bg-gradient-to-t from-background to-transparent z-15 pointer-events-none md:inset-y-0 md:h-auto md:w-full md:bg-gradient-to-t md:from-background md:via-background/20 md:to-transparent" />
        <div className="absolute left-0 right-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-15 pointer-events-none hidden md:block" />

        <div className="relative z-20 w-full min-w-0 px-4 py-10 sm:px-8 md:px-12 md:py-16 lg:px-16">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-black/60"
          >
            <ArrowLeft className="size-4" /> Back
          </button>
          
          <div className="grid w-full min-w-0 gap-10 md:grid-cols-3 md:items-center md:gap-8">
            <div className="min-w-0 space-y-4 md:col-span-2">
              {titleLogoUrl ? (
                <img
                  src={titleLogoUrl}
                  alt={movie.title}
                  draggable={false}
                  className="mb-4 max-h-24 w-auto max-w-full object-contain select-none sm:max-h-32 md:max-h-36"
                />
              ) : (
                <h1 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md">{movie.title}</h1>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                {movie.score != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-lg sm:px-3 sm:py-1.5">
                    <Star className="size-3 fill-current" /> {movie.score.toFixed(1)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-lg sm:px-3 sm:py-1.5">
                  <Calendar className="size-3" /> {movie.year}
                </span>
                <AgeRatingBadge
                  rating={movie.rating}
                  className="rounded-full px-2.5 py-1 text-xs backdrop-blur-lg sm:px-3 sm:py-1.5"
                />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-lg sm:px-3 sm:py-1.5">
                  <Clock className="size-3" /> {movie.runtime}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {movie.genres && movie.genres.length > 0 ? (
                  // Pick up to 10 genres to be displayed
                  movie.genres.slice(0, 10).map((genreName: string, i: number) => {
                    // Normalize the name string directly into a clean lowercase URL slug asset tracker
                    const genreSlug = genreName.toLowerCase().trim().replace(/\s+/g, '-');
                    
                    return (
                      <Link
                        key={`${genreSlug}-${i}`}
                        to="/explore/$genreId"
                        params={{ genreId: genreSlug }} // Passes the string slug directly as the resource parameter
                        search={{ q: genreName }}        // Keeps your app's standard query search parameter filled
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-lg transition hover:bg-white/10 hover:border-primary/50"
                      >
                        {genreName}
                      </Link>
                    );
                  })
                ) : (
                  // Fallback: Legacy loop to handle native TMDB items if they ever load
                  movie.genreIds?.map((gid: number, i: number) => {
                    const label = genreLabels[String(gid)] || "Explore";
                    return (
                      <Link
                        key={`${gid}-${i}`}
                        to="/explore/$genreId"
                        params={{ genreId: String(gid) }}
                        search={{ q: label }}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-lg transition hover:bg-white/10 hover:border-primary/50"
                      >
                        {label}
                      </Link>
                    );
                  })
                )}
              </div>
              
              <div className="min-w-0">
                <p className={`max-w-xl break-words text-base md:text-lg text-gray-300 leading-relaxed ${descExpanded ? "" : "line-clamp-3"}`}>
                  {movie.description}
                </p>
                <button
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-1 text-xs font-medium text-primary"
                >
                  {descExpanded ? "Show less" : "Show more"}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 sm:gap-3">
                <Link
                  to="/watch/$id"
                  params={{ id: movie.id }}
                  search={
                    isTv
                      ? { autoplay: true, season: 1, episode: 1, source: "wp" }
                      : { autoplay: true, source: "wp" } // Injects source parameter directly into target router paths
                  }
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/85 sm:px-6 sm:py-3 shadow-lg"
                >
                  <Play className="size-4 fill-current sm:size-5" />{" "}
                  {isTv ? "Play S1 E1" : "Play"}
                </Link>
                {movie.trailer && (
                  <button
                    onClick={() => setTrailerOpen(true)}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 sm:px-6 sm:py-3"
                  >
                    <Clapperboard className="size-4 sm:size-5" /> Trailer
                  </button>
                )}
                <button
                  onClick={() => {
                    if (watched) {
                      unmarkWatched(movie.id);
                      setWatched(false);
                      toast.success(`${movie.title} marked as not watched`);
                    } else {
                      markAsWatched(movie);
                      setWatched(true);
                      toast.success(`${movie.title} marked as watched`);
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-white/10 sm:px-4 sm:py-3"
                >
                  <Check className="size-4 sm:size-5" /> {watched ? "Watched" : "Unwatched"}
                </button>
                <button
                  onClick={() => {
                    const added = toggleMyList(movie);
                    setInList(added);
                    toast.success(added ? "Added to My List" : "Removed from My List");
                  }}
                  className={`grid size-11 sm:size-12 place-items-center rounded-full border ${
                    inList ? "border-primary bg-primary/20 text-primary" : "border-border hover:border-foreground"
                  }`}
                  aria-label={inList ? "Remove from My List" : "Add to My List"}
                >
                  <Bookmark className={`size-4 sm:size-5 ${inList ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => {
                    const base = siteUrl();
                    shareContent({
                      title: `${movie.title} (${movie.year})`,
                      text: `${movie.title} (${movie.year}) — ${movie.description}`,
                      url: base ? `${base}/movie/${movie.id}` : window.location.href,
                      image: movie.backdropSm || movie.backdrop || movie.poster || undefined,
                    }).then((mode) => toast.success(mode === "shared" ? "Shared" : "Link copied"));
                  }}
                  className="grid size-11 sm:size-12 place-items-center rounded-full border border-border hover:border-foreground"
                  aria-label="Share"
                >
                  <Share2 className="size-4 sm:size-5" />
                </button>
              </div>
              <div className="min-w-0 pt-4">
                <p className="mb-3 text-sm font-semibold text-foreground sm:text-base">Cast</p>
                <div className="relative min-w-0 max-w-full">
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {movie.cast && movie.cast.length > 0 ? (
                      movie.cast.map((actorName: string, index: number) => (
                        <div 
                          key={`${actorName}-${index}`} 
                          className="flex flex-col items-center shrink-0 w-20 text-center space-y-1.5"
                        >
                          {/* Fallback elegant monogram profile avatar circle since we have no PFP image URLs from WP */}
                          <div className="size-14 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center font-bold text-zinc-400 text-sm select-none shadow-md">
                            {actorName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs text-zinc-400 font-medium line-clamp-2 max-w-full leading-tight">
                            {actorName}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-zinc-500">No cast information available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {offersLoading && (
        <section className="px-4 sm:px-8 md:px-12 lg:px-16 py-6">
          <h2 className="mb-3 text-xl font-bold text-foreground">Where to Watch</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surface p-2 animate-pulse">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background/50" />
                <div className="h-2 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        </section>
      )}
      {!offersLoading && offers.length > 0 && (
        <section className="px-4 sm:px-8 md:px-12 lg:px-16 py-6">
          <h2 className="mb-3 text-xl font-bold text-foreground">Where to Watch</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
            {(showAllOffers ? offers : offers.slice(0, 7)).map((offer) => (
              <a
                key={offer.provider_id}
                href={offer.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-1.5 rounded-lg border border-border bg-surface p-2 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-background/50">
                  {offer.logo_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${offer.logo_path}`}
                      alt={offer.provider_name}
                      className="h-8 w-8 object-contain"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium text-foreground truncate text-center w-full leading-tight">
                  {offer.provider_name}
                </span>
              </a>
            ))}
          </div>
          {offers.length > 7 && (
            <div className="mt-3 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAllOffers((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur transition hover:bg-background hover:border-primary/50"
              >
                {showAllOffers ? (
                  <>
                    <ChevronUp className="size-4" />
                    Show less
                  </>
                ) : (
                  <>
                    Show more ({offers.length})
                    <ChevronDown className="size-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      )}
      {!offersLoading && offers.length === 0 && (
        <section className="px-4 sm:px-8 md:px-12 lg:px-16 py-8">
          <h2 className="mb-4 text-2xl font-bold text-foreground">Where to Watch</h2>
          <p className="text-muted-foreground">No streaming offers found for this title.</p>
        </section>
      )}

      {filteredSimilar.length > 0 && (
        <div className="space-y-2">
          {(() => {
            const groups = new Map<string, typeof filteredSimilar>();
            for (const m of filteredSimilar) {
              const g = m.genres[0] || "Other";
              if (!groups.has(g)) groups.set(g, []);
              groups.get(g)!.push(m);
            }
            return Array.from(groups.entries()).map(([genre, items]) => (
              <Row key={genre} title={`More ${genre}`} items={items} />
            ));
          })()}
        </div>
      )}

      {filteredRecommendations.length > 0 && (
        <div className="space-y-2 pb-4">
          <Row title="Recommended" items={filteredRecommendations} />
        </div>
      )}

      <div className="space-y-2 pb-10">
        {filteredGenreRows.map((gr) => {
          const label = genreLabels[gr.genreId] || "Others You May Like";
          return <Row key={gr.genreId} title={`${label} Movies`} items={gr.items} />;
        })}
      </div>

      {trailerOpen && movie.trailer && (
        <TrailerModal url={movie.trailer} onClose={() => setTrailerOpen(false)} />
      )}
      <Footer />
    </div>
  );
}
