import { createFileRoute, Link, notFound, useLocation,  useNavigate, useRouter } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Play, Share2, ArrowLeft,  Check,  Bookmark,  Star,  Calendar,  Clock } from "lucide-react";
import { toast } from "sonner";
import { shareContent } from "@/lib/share";
import { seoMetaFor, siteUrl } from "@/lib/seo";
import { stepsToUsefulBackTarget } from "@/lib/nav-history";
import { getWatchHistory, markAsWatched, unmarkWatched } from "@/lib/continue-watching";
import { isInMyList, toggleMyList } from "@/lib/my-list";
import { Navbar } from "@/components/streamflix/Navbar";
import { Footer } from "@/components/streamflix/Footer";
import { Row } from "@/components/streamflix/Row";
import { searchKeyword } from "@/lib/api/tmdb";
import { AgeRatingBadge } from "@/components/streamflix/AgeRatingBadge";
import { MovieSkeleton } from "@/components/streamflix/MovieSkeleton";
import { CACHE_TTL, EMPTY_MOVIE_LIST, MOVIE_SORT_OPTIONS, PAGED_LIST_SIZE, SEO_SITE_NAME } from '@/lib/constants';
import { movieDetailsQueryOptions } from "@/lib/api/tmdb";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/movies/$id")({
  loader: async ({ params, context: { queryClient } }) => {
    const movie = await queryClient.ensureQueryData(movieDetailsQueryOptions(params.id));
    if (!movie) {
      throw notFound();
    }
    return { movie };
  },
  head: ({ loaderData }) => {
    const movie = loaderData?.movie;
    const title = movie ? `${SEO_SITE_NAME} - ${movie.title }` : `${SEO_SITE_NAME} - Movie`;
    const description = movie?.description
      ? `${movie.description.slice(0, 200)}`
      : "Watch Japanese AV movies in HD on {SEO_SITE_NAME} .";
    const image = movie?.backdropSm || movie?.poster || "";
    const site = siteUrl();
    const url = site ? `${site}/movies/${movie?.id ?? ""}` : "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(movie && movie.genres?.length
          ? [{ name: "keywords", content: movie.genres.join(", ") }]
          : []),
        ...seoMetaFor(
          title,
          description,
          image,
          "video.movie",
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
  const { movie } = Route.useLoaderData();
  const [descExpanded, setDescExpanded] = useState(false);
  const castScrollerRef = useRef<HTMLDivElement | null>(null);
  const [showPicker, setShowPicker] = useState(true);
  const [castScroll, setCastScroll] = useState({ left: 0, viewport: 0, width: 0 });

  // 1. Prepare space-delimited text keys safely on the client
  const actorSearchString = movie.cast?.filter(n => n && n !== "Unknown Cast").join(" ") || "";
  const genreSearchString = movie.genres?.filter(g => g).join(" ") || "";
  const serieSearchString = movie.codePrefix?.trim() || "";
  const studioSearchString = movie.production_company?.trim() || "";

  // 2. Fetch recommendations smoothly with zero server-side blocks
  const relatedActorsQuery = useQuery({
    queryKey: ["search_keyword_actor", { actorSearchString }],
    queryFn: () => searchKeyword({ data: { q: actorSearchString, page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.POPULAR } }),
    enabled: actorSearchString.length > 0, 
    staleTime: CACHE_TTL.MOVIES, 
  });

  const relatedGenresQuery = useQuery({
    queryKey: ["search_keyword_genres", { genreSearchString }],
    queryFn: () => searchKeyword({ data: { q: genreSearchString, page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.POPULAR } }),
    enabled: actorSearchString.length > 0, 
    staleTime: CACHE_TTL.MOVIES, 
  });

  const relatedSerieQuery = useQuery({
    queryKey: ["search_keyword_series", { serieSearchString}],
    queryFn: () => searchKeyword({ data: { q: serieSearchString, page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.POPULAR } }),
    enabled: !!movie.codePrefix,
    staleTime: CACHE_TTL.MOVIES,
  });

  const relatedStudioQuery = useQuery({
    queryKey: ["search_keyword_studios", { studioSearchString }],
    queryFn: () => searchKeyword({ data: { q: studioSearchString, page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.POPULAR } }),
    enabled: !!movie.production_company,
    staleTime: CACHE_TTL.MOVIES,
  });

  const moviesByRelatedActors = (relatedActorsQuery.data?.results || []).filter((m: any) => String(m.id) !== String(movie.id));
  const moviesByRelatedGenres = (relatedGenresQuery.data?.results || []).filter((m: any) => String(m.id) !== String(movie.id));
  const moviesByRelatedSerie  = (relatedSerieQuery.data?.results || []).filter((m: any) => String(m.id) !== String(movie.id));
  const moviesByRelatedStudio = (relatedStudioQuery.data?.results || []).filter((m: any) => String(m.id) !== String(movie.id));

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

  const [inList, setInList] = useState(false);
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    setInList(isInMyList(movie.id));
    setWatched(getWatchHistory().some((x) => x.id === movie.id || x.id.startsWith(`${movie.id}:`)));
  }, [movie.id]);


  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
  const goBack = () => {
    const steps = stepsToUsefulBackTarget(location.pathname, [`/watch/${movie.id}`]);
    if (steps !== null) {
      router.history.go(-steps);
    } else {
      navigate({ to: "/movies" });
    }
  };

  const scrollCast = (dir: 1 | -1) => {
    const el = castScrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (7 * 104), behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <Navbar />
      
      {/* ========================================================================= */}
      {/* AREA 1: 🎬 CINEMATIC HERO BANNER MAIN OVERLAY WRAPPER                    */}
      {/* ========================================================================= */}
      <section className="relative w-full h-auto min-h-[65vh] sm:min-h-[75vh] md:min-h-[90vh] lg:min-h-screen flex flex-col justify-end overflow-hidden select-none">
        
        {/* BACKGROUND CANVAS (Unblurred on mobile, blurred on desktop) */}
        <div className="absolute inset-0 size-full pointer-events-none z-0">
          <img 
            src={movie.backdrop || movie.poster} 
            alt="" 
            className="size-full object-cover md:blur-lg opacity-85 brightness-75 md:brightness-70 transition-all duration-300" 
          />
        </div>

        {/* DESKTOP FOREGROUND ARTWORK (Hidden on mobile) */}
        <div className="pointer-events-none absolute inset-y-0 right-0 hidden md:flex items-center justify-end md:pr-12 lg:pr-24 xl:pr-32 opacity-90 z-20">
          <img 
            src={movie.poster} 
            alt="" 
            className="h-[65%] w-auto object-contain rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/5" 
          />
        </div>

        {/* CINEMATIC SHADER GRADIENT VIGNETTES */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent md:hidden z-10" />
        <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-background via-background/90 to-transparent hidden md:block z-10" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent hidden md:block z-10" />

        {/* FLOATING CORNER BACK LINK */}
        <button
          type="button"
          onClick={goBack}
          aria-label="Go back"
          className="absolute top-20 left-4 md:top-24 md:left-12 lg:left-16 z-30 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3.5 py-2 text-sm font-medium text-white backdrop-blur-md transition hover:bg-black/80 shadow-md"
        >
          <ArrowLeft className="size-4" /> <span>Back</span>
        </button>

        {/* HERO CONTAINER OVERLAY CONTENT LAYERS */}
        <div className="relative z-20 w-full px-4 pb-8 pt-28 sm:px-8 md:px-12 md:pb-16 lg:px-16 text-center md:text-left flex flex-col items-center md:items-start space-y-4">
          
          <div className="w-full max-w-2xl sm:max-w-3xl space-y-3.5 mx-auto md:mx-0">
            {/* Main Title Heading */}
            <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight">
              {movie.title}
            </h1>
            
            {/* Micro Badge Metadata Indicators */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-medium pt-0.5">
              {movie.score != null && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-emerald-400 backdrop-blur-md">
                  <Star className="size-3 fill-current" /> {movie.score.toFixed(1)}
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-zinc-300 backdrop-blur-md">
                <Calendar className="size-3" /> {movie.year}
              </span>
              <AgeRatingBadge
                rating={movie?.rating || "NR"}
                className="rounded-full px-2.5 py-0.5 bg-black/30 backdrop-blur-md text-zinc-300 border border-white/5"
              />
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2.5 py-0.5 text-zinc-300 backdrop-blur-md">
                <Clock className="size-3" /> {movie.runtime}
              </span>
            </div>
            
            {/* 🟢 GENRE CHIPS PANEL: Restored clickable design tags layout */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-0.5">
              {movie.genres && movie.genres.length > 0 ? (
                movie.genres.slice(0, 10).map((genreName: string, i: number) => {
                  const genreSlug = genreName.toLowerCase().trim().replace(/\s+/g, '-');
                  return (
                    <Link
                      key={`genre-chip-${genreSlug}-${i}`}
                      to="/collections/genres/$genreSlug"
                      params={{ genreSlug: genreSlug }}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-200 backdrop-blur-md transition hover:bg-white/10 hover:border-primary/50 shadow-sm"
                    >
                      {genreName}
                    </Link>
                  );
                })
              ) : (
                <span className="text-zinc-500 text-xs">Uncategorized</span>
              )}
            </div>
            
            {/* 🟢 DESKTOP ONLY DESCRIPTION CONTAINER: Hidden completely on mobile */}
            <div className="min-w-0 text-center md:text-left hidden sm:block">
              <p className="max-w-xl break-words text-sm md:text-base text-zinc-300 leading-relaxed drop-shadow-md line-clamp-2 md:line-clamp-3">
                {movie.description}
              </p>
              <button 
                type="button" 
                onClick={() => setDescExpanded((v) => !v)} 
                className="mt-1 text-xs font-semibold text-primary block md:inline"
              >
                {descExpanded ? "Show less" : "Show more"}
              </button>
            </div>

            {/* Action Row Panel Panel controls row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1 pb-4 border-b border-zinc-800/40 md:border-none">
              <Link
                to="/watch/$id"
                params={{ id: movie.id }}
                search={{ autoplay: true } as any}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-white/85 shadow-lg transition"
              >
                <Play className="size-4 fill-current" /> Play
              </Link>                
              
              <button
                type="button"
                onClick={() => {
                  if (watched) {
                    unmarkWatched(movie.id);
                    setWatched(false);
                    toast.success("Removed from history");
                  } else {
                    markAsWatched(movie);
                    setWatched(true);
                    toast.success("Marked as watched");
                  }
                }}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-zinc-700 bg-zinc-900/60 backdrop-blur-md px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                <Check className="size-4" /> {watched ? "Watched" : "Unwatched"}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const added = toggleMyList(movie);
                  setInList(added);
                  toast.success(added ? "Added to My List" : "Removed from My List");
                }}
                className={`grid size-11 place-items-center rounded-full border transition ${
                  inList ? "border-primary bg-primary/20 text-primary" : "border-zinc-700 bg-zinc-900/60 backdrop-blur-md text-white"
                }`}
                aria-label="Save list status"
              >
                <Bookmark className={`size-4 ${inList ? "fill-current" : ""}`} />
              </button>

              <button
                type="button"
                onClick={() => {
                  const base = siteUrl();
                  shareContent({
                    title: `${movie.title} (${movie.year})`,
                    text: `${movie.title} (${movie.year}) — ${movie.description}`,
                    url: base ? `${base}/movies/${movie.id}` : window.location.href,
                    image: movie.backdropSm || movie.backdrop || movie.poster || undefined,
                  }).then((mode) => toast.success(mode === "shared" ? "Shared" : "Link copied"));
                }}
                className="grid size-11 place-items-center rounded-full border border-zinc-700 bg-zinc-900/60 backdrop-blur-md text-white hover:border-white transition"
                aria-label="Share content node"
              >
                <Share2 className="size-4" />
              </button>
            </div>

            {/* ========================================================================= */}
            {/* 🟢 INTEGRATED HORIZONTAL GRID: Widescreen column rows layout             */}
            {/* ========================================================================= */}
            <div className="hidden md:flex md:flex-wrap lg:flex-nowrap gap-x-10 gap-y-6 pt-4 mt-4 w-full max-w-2xl lg:max-w-3xl text-left border-t border-white/10">
              
              {/* SECTION 1: CAST (Now wraps down to a new line gracefully when it contains > 3 items) */}
              <div className="flex flex-col space-y-2 min-w-0 max-w-sm xl:max-w-md">
                <p className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Cast</p>
                {/* 🟢 flex-wrap ensures items drop neatly to line 2 instead of cutting off */}
                <div className="flex flex-wrap gap-x-3 gap-y-3 max-h-36 overflow-y-auto pr-1">
                  {movie.cast && movie.cast.length > 0 ? (
                    movie.cast.map((actorName: string, index: number) => (
                      <Link 
                        key={`desktop-cast-${index}`}
                        to="/collections/actresses/$actorSlug"
                        params={{ actorSlug: actorName.toLowerCase().trim().replace(/\s+/g, '-') }}
                        className="group flex flex-col items-center shrink-0 w-20 text-center space-y-1"
                      >
                        <div className="size-11 rounded-full bg-zinc-900/80 border border-white/10 group-hover:border-primary flex items-center justify-center font-bold text-zinc-400 text-xs select-none shadow-md backdrop-blur-sm transition">
                          {actorName.split(' ').map((n: string) => n).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium line-clamp-2 max-w-full leading-tight group-hover:text-white transition">
                          {actorName}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-600">None</span>
                  )}
                </div>
              </div>

              {/* SECTION 2: DIRECTORS */}
              <div className="flex flex-col space-y-2 shrink-0 min-w-[100px]">
                <p className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Directors</p>
                <div className="flex flex-wrap gap-3">
                  {movie.director && movie.director.length > 0 ? (
                    movie.director.map((directorName: string, index: number) => (
                      <Link 
                        key={`desktop-dir-${index}`}
                        to="/collections/directors/$directorSlug"
                        params={{ directorSlug: directorName.toLowerCase().trim().replace(/\s+/g, '-') }}
                        className="group flex flex-col items-center shrink-0 w-20 text-center space-y-1"
                      >
                        <div className="size-11 rounded-full bg-zinc-900/80 border border-white/10 group-hover:border-primary flex items-center justify-center font-bold text-zinc-400 text-xs select-none shadow-md backdrop-blur-sm transition">
                          {directorName.split(' ').map((n: string) => n).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] text-zinc-400 font-medium line-clamp-2 max-w-full leading-tight group-hover:text-white transition">
                          {directorName}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-600">None</span>
                  )}
                </div>
              </div>

              {/* SECTION 3: STUDIO */}
              <div className="flex flex-col space-y-2 shrink-0 min-w-[100px]">
                <p className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Studio</p>
                <div className="flex flex-wrap gap-3">
                  {movie.production_company ? (
                    <Link
                      to="/collections/studios/$studioSlug"
                      params={{ studioSlug: movie.production_company.toLowerCase().trim().replace(/\s+/g, '-') }}
                      className="group flex flex-col items-center shrink-0 w-20 text-center space-y-1"
                    >
                      <div className="size-11 rounded-full bg-zinc-900/80 border border-white/10 group-hover:border-primary flex items-center justify-center font-bold text-zinc-400 text-xs select-none shadow-md backdrop-blur-sm transition">
                        {movie.production_company.split(' ').map((n: string) => n).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] text-zinc-400 font-medium line-clamp-2 max-w-full leading-tight group-hover:text-white transition">
                        {movie.production_company}
                      </span>
                    </Link>
                  ) : (
                    <span className="text-xs text-zinc-600">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ========================================================================= */}
      {/* AREA 2: 🎞️ MOBILE FALLBACK & LOWER CONTENT GRID (Recommended Framework)   */}
      {/* ========================================================================= */}
      <section className="px-4 py-6 sm:px-8 md:px-12 lg:px-16 w-full max-w-[1800px] mx-auto z-20 bg-background flex flex-col space-y-6">
        
        {/* MOBILE STACK DESCRIPTION & DATA LAYOUT ROOM */}
        {/* 🟢 Renders ONLY on mobile screens to ensure zero desktop layout cluttering */}
        <div className="block md:hidden border-b border-zinc-800 pb-6 space-y-5">
          <div className="block md:hidden border-b border-zinc-800 pb-4">
            <p className="text-sm text-zinc-400 leading-relaxed break-words">
              {movie.description}
            </p>
          </div>

          {/* Mobile Cast Row */}
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold tracking-wider text-zinc-500 uppercase">Cast</p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {movie.cast && movie.cast.length > 0 ? (
                movie.cast.map((actorName: string, index: number) => (
                  <Link 
                    key={`mobile-cast-${index}`}
                    to="/collections/actresses/$actorSlug"
                    params={{ actorSlug: actorName.toLowerCase().trim().replace(/\s+/g, '-') }}
                    className="flex flex-col items-center shrink-0 w-20 text-center space-y-1.5"
                  >
                    <div className="size-14 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center font-bold text-zinc-400 text-sm select-none shadow-md">
                      {actorName.split(' ').map((n: string) => n).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-zinc-400 font-medium line-clamp-2 max-w-full leading-tight">
                      {actorName}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-zinc-600">No cast listed.</p>
              )}
            </div>
          </div>

          {/* Mobile Directors Row */}
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold tracking-wider text-zinc-500 uppercase">Directors</p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {movie.director && movie.director.length > 0 ? (
                movie.director.map((directorName: string, index: number) => (
                  <Link 
                    key={`mobile-dir-${index}`}
                    to="/collections/directors/$directorSlug"
                    params={{ directorSlug: directorName.toLowerCase().trim().replace(/\s+/g, '-') }}
                    className="flex flex-col items-center shrink-0 w-20 text-center space-y-1.5"
                  >
                    <div className="size-14 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center font-bold text-zinc-400 text-sm select-none shadow-md">
                      {directorName.split(' ').map((n: string) => n).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-zinc-400 font-medium line-clamp-2 max-w-full leading-tight">
                      {directorName}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="text-xs text-zinc-600">No directors listed.</p>
              )}
            </div>
          </div>
          
          {/* Mobile Studio Row */}
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold tracking-wider text-zinc-500 uppercase">Studio</p>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
              {movie.production_company ? (
                <Link
                  to="/collections/studios/$studioSlug"
                  params={{ studioSlug: movie.production_company.toLowerCase().trim().replace(/\s+/g, '-') }}
                  className="flex flex-col items-center shrink-0 w-20 text-center space-y-1.5"
                >
                  <div className="size-14 rounded-full bg-zinc-800 border border-white/5 flex items-center justify-center font-bold text-zinc-400 text-sm select-none shadow-md">
                    {movie.production_company.split(' ').map((n: string) => n).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs text-zinc-400 font-medium line-clamp-2 max-w-full leading-tight">
                    {movie.production_company}
                  </span>
                </Link>
              ) : (
                <p className="text-xs text-zinc-600">No studio information listed.</p>
              )}
            </div>
          </div>
        </div>
      </section>      
      {/* ========================================================================= */}
      {/* RECOMMENDATION BLOCK FEED (Pushes immediately under the banner elements) */}
      {/* ========================================================================= */}
      {moviesByRelatedActors.length > 0 && (
        <div className="space-y-2 pb-4">
          <Row title="Same Actress" items={moviesByRelatedActors} sort={MOVIE_SORT_OPTIONS.POPULAR} />
        </div>
      )}
      {moviesByRelatedStudio.length > 0 && (
        <div className="space-y-2 pb-4">
          <Row title="Same Producer" items={moviesByRelatedStudio} sort={MOVIE_SORT_OPTIONS.POPULAR} />
        </div>
      )}
      {moviesByRelatedSerie.length > 0 && (
        <div className="space-y-2 pb-4">
          <Row title="Related Series" items={moviesByRelatedSerie} sort={MOVIE_SORT_OPTIONS.POPULAR} />
        </div>
      )}
      {moviesByRelatedGenres.length > 0 && (
        <div className="space-y-2 pb-4">
          <Row title="Related Movies" items={moviesByRelatedGenres} sort={MOVIE_SORT_OPTIONS.POPULAR} />
        </div>
      )}
      <Footer />
    </div>
  );
}
