import { Sparkles } from "lucide-react";
import type { Movie } from "@/lib/types";

interface CinematicHeroBannerProps {
  heroMovie?: Movie;
  termName: string;
  totalResults: number;
  vibeLabelSingular?: string; // Optional customization tag (e.g. "genre", "actress", "maker")
  fallbackGradientClass?: string;
}

export function CinematicHeroBanner({
  heroMovie,
  termName,
  totalResults,
  vibeLabelSingular = "category",
  fallbackGradientClass = "from-purple-900/40",
}: CinematicHeroBannerProps) {
  // Safe background asset parsing lookups
  const backdropAsset = heroMovie?.backdrop || heroMovie?.poster;

  return (
    <section className="relative flex h-[30vh] items-end overflow-hidden sm:h-[30vh] bg-zinc-950 border-b border-border/40 select-none">
      {/* Background Handler Viewport */}
      {backdropAsset ? (
        <img 
          src={backdropAsset} 
          alt="" 
          className="absolute inset-0 size-full object-cover opacity-30 blur-sm scale-105 select-none pointer-events-none" 
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradientClass} via-surface to-background`} />
      )}
      
      {/* Structural Mask Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      
      {/* Content Frame */}
      <div className="relative z-10 w-full px-4 pb-8 sm:px-8 md:px-16">
        <div className="flex items-center gap-2 text-emerald-400 drop-shadow">
          <Sparkles className="size-5 animate-pulse" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            {vibeLabelSingular}
          </span>
        </div>
        
        <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-6xl text-white drop-shadow-md">
          {termName}
        </h1>
        
        <p className="mt-2 max-w-xl text-sm text-foreground/80 sm:text-base drop-shadow">
          {totalResults.toLocaleString()} titles hand-picked to match this view.
        </p>
      </div>
    </section>
  );
}
