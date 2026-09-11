import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Play, Info, Calendar, Clock, Star } from "lucide-react";
import { AgeRatingBadge } from "./AgeRatingBadge";
import type { Movie } from "@/lib/types";

export function CinematicHeroCarousel({ slides }: { slides: Movie[] }) {
  const [i, setI] = useState(0);
  const touchStart = useRef<number | null>(null);
  const touchDelta = useRef(0);

  useEffect(() => {
    if (slides.length === 0) return;
    const t = setInterval(() => setI((v) => (v + 1) % slides.length), 8000);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = useCallback((dir: -1 | 1) => {
    setI((v) => (v + dir + slides.length) % slides.length);
  }, [slides.length]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
    touchDelta.current = 0;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    touchDelta.current = e.touches[0].clientX - touchStart.current;
  }, []);

  const onTouchEnd = useCallback(() => {
    const threshold = 50;
    if (touchDelta.current > threshold) go(-1);
    else if (touchDelta.current < -threshold) go(1);
    touchStart.current = null;
    touchDelta.current = 0;
  }, [go]);
  
  const genreLabels: Record<string, string> = {
    "28": "Action",
    "12": "Adventure",
    "16": "Animation",
    "35": "Comedy",
    "80": "Crime",
    "99": "Documentary",
    "18": "Drama",
    "10751": "Family",
    "14": "Fantasy",
    "36": "History",
    "27": "Horror",
    "10402": "Music",
    "9648": "Mystery",
    "10749": "Romance",
    "878": "Sci-Fi",
    "10752": "War",
    "37": "Western",
    "53": "Thriller",
  };
  
  if (slides.length === 0) return null;
  const s = slides[i];
  if (!s) return null;
  const MAX_DESC_CHARS = 150;
  const description =
    s.description && s.description.length > MAX_DESC_CHARS
      ? `${s.description.slice(0, MAX_DESC_CHARS - 3).trimEnd()}...`
      : s.description;

  //const titleLogoUrl = s.poster || s.backdrop;
  const titleLogoUrl = null; // Don't display small poster

  return (
    <section
      className="relative min-h-[40vh] h-[50vh] w-full overflow-hidden sm:min-h-[400px] sm:h-[65vh] lg:min-h-[550px] lg:h-[85vh] bg-background"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* ============================================================ */}
      {/* DUAL-LAYER IMAGE RENDER LOOP ENGINE (FIXED ASPECT RATIO)     */}
      {/* ============================================================ */}
      {slides.map((slide, idx) => {
        const isCurrent = idx === i;
        const near = Math.abs(idx - i) <= 1;
        const imageSrc = near ? slide.backdrop : undefined;

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 size-full transition-opacity duration-1000 overflow-hidden ${
              isCurrent ? "opacity-100 z-0" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* LAYER 1: Ambient Blurred Background (Brings portrait artwork out to wide screen edges) 
                blur-sm | blur |blur-md | blur-lg | blur-xl| blur-3xl
            */}
            <div className="absolute inset-0 size-full select-none pointer-events-none overflow-hidden scale-110 transform">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt=""
                  loading={idx === i ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={idx === i ? "high" : "low"}
                  className={`size-full object-cover blur-sm opacity-70 brightness-80 ${
                    isCurrent ? "animate-ken-burns" : ""
                  }`}
                />
              )}
            </div>

            {/* LAYER 2: Crisp Foreground Portrait Poster (Preserves real proportions on right screen boundary) */}
            <div className="absolute inset-0 size-full flex items-center justify-end pr-0 md:pr-16 lg:pr-32 z-10 select-none pointer-events-none opacity-80 md:opacity-90">
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt=""
                  loading={idx === i ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={idx === i ? "high" : "low"}
                  className="h-[80%] w-auto object-contain rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] border border-white/5 hidden md:block"
                />
              )}
            </div>
          </div>
        );
      })}
      {/* ============================================================ */}

      {/* Shading Gradients Masks Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent md:h-72 z-10 pointer-events-none" />

      {/* Dynamic Text Information Overlay Content Box */}
      <div className="relative z-10 flex h-full items-end justify-center px-4 pb-8 pt-10 text-center sm:px-8 md:items-end md:justify-start">
        <div key={s.id} className="animate-fade-in w-full max-w-none space-y-3 text-center md:max-w-3xl md:text-left">
          {titleLogoUrl ? (
            <img
              src={titleLogoUrl}
              alt={s.title}
              draggable={false}
              className="mb-4 mx-auto md:mx-0 max-h-24 w-auto max-w-full object-contain select-none sm:max-h-32 md:max-h-36"
            />
          ) : (
            <h1 className="mb-4 text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-md">{s.title}</h1>
          )}
          
          {s.genres && s.genres.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-sm sm:text-base font-normal text-white/80 tracking-wide drop-shadow">
              {s.genres.slice(0, 3).map((genreName, idx) => (
                <span key={genreName} className="flex items-center gap-1.5">
                  {idx > 0 && <span className="text-white/40">·</span>}
                  {genreName}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm md:justify-start md:text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-lg sm:px-3 sm:py-1.5">
              <Calendar className="size-3" /> {s.year}
            </span>
            {s.score != null && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 backdrop-blur-lg sm:px-3 sm:py-1.5">
                <Star className="size-3 fill-current" /> {s.score.toFixed(1)}
              </span>
            )}
            <AgeRatingBadge
              rating={String(s.rating)}
              className="rounded-full px-2.5 py-1 text-xs backdrop-blur-lg sm:px-3 sm:py-1.5"
            />
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-lg sm:px-3 sm:py-1.5">
              <Clock className="size-3" /> {s.runtime}
            </span>
          </div>
          <p className="hidden md:block mx-auto md:mx-0 text-lg lg:text-xl text-gray-200 leading-relaxed max-w-xl drop-shadow">
            {description}
          </p>
          <div className="mx-auto md:mx-0 flex flex-wrap items-center justify-center gap-2 md:justify-start">
            <Link
              to="/watch/$id"
              params={{ id: s.id }}
              search={{ source: "wp" } as any} // FIX: Passes source parameter to select player layouts
              className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-semibold text-black transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 hover:bg-white/85 sm:px-5 sm:py-3 sm:text-sm shadow-lg"
            >
              <Play className="size-4 fill-current sm:size-5" /> Play
            </Link>
            <Link
              to="/movies/$id"
              params={{ id: s.id }}
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-8 bg-gray-600/30 backdrop-blur-sm border-gray-400 text-white hover:bg-gray-600/50 font-semibold px-3 py-2 text-xs rounded-lg transition-all duration-200 sm:h-10 sm:px-6 sm:py-3 sm:text-base lg:h-11 lg:px-8 lg:py-4 lg:text-lg"
            >
              <Info /> More Info
            </Link>
          </div>
        </div>
      </div>

      {/* Slider Carousel Pips Controller Navigation Dots Panel */}
      <div className="absolute bottom-6 inset-x-0 z-10 flex items-center justify-center gap-2 sm:justify-end sm:right-8 sm:inset-x-auto">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-[4px] rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-2 bg-white/40"}`}
            aria-label={`Slide ${idx + 1}`}
            type="button"
          />
        ))}
      </div>
    </section>
  );
}
