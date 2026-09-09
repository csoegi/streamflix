import { Compass } from "lucide-react";

export type BannerThemeColor = "purple" | "red" | "emerald" | "amber" | "blue" | "rose";

interface CinematicBannerProps {
  themeColor: BannerThemeColor;
  title: string;
  totalCount: number;
  countLabelSingular: string;
  countLabelPlural?: string;
  subtitle?: string;
}

// Maps abstract color names cleanly to responsive utility style classes
const themeStylesMap: Record<BannerThemeColor, { gradient: string; text: string }> = {
  purple: {
    gradient: "from-purple-500/50",
    text: "text-purple-300",
  },
  red: {
    gradient: "from-red-500/50",
    text: "text-red-300",
  },
  emerald: {
    gradient: "from-emerald-500/50",
    text: "text-emerald-300",
  },
  amber: {
    gradient: "from-amber-500/50",
    text: "text-amber-300",
  },
  blue: {
    gradient: "from-blue-500/50",
    text: "text-blue-300",
  },
  rose: {
    gradient: "from-rose-500/50",
    text: "text-rose-300",
  },
};

export function CinematicBanner({
  themeColor,
  title,
  totalCount,
  countLabelSingular,
  countLabelPlural,
  subtitle,
}: CinematicBannerProps) {
  const activeStyles = themeStylesMap[themeColor] || themeStylesMap.purple;
  const pluralLabel = countLabelPlural || `${countLabelSingular}s`;
  const dynamicCountText = `${totalCount.toLocaleString()} ${totalCount === 1 ? countLabelSingular : pluralLabel}.`;

  return (
    <section className="relative flex h-[30vh] items-end overflow-hidden sm:h-[30vh] bg-zinc-950/40 border-b border-border select-none">
      {/* Structural Backdrop Mask Layers */}
      <div className={`absolute inset-0 bg-gradient-to-br ${activeStyles.gradient} via-surface to-background`} />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      
      {/* Content Frame */}
      <div className="relative z-10 w-full px-4 pb-6 sm:px-8 md:px-16">
        <div className={`flex items-center gap-2 ${activeStyles.text}`}>
          <Compass className="size-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">Explore</span>
        </div>
        
        <h1 className="mt-1 text-4xl font-black tracking-tight sm:text-6xl text-white">
          {title}
        </h1>
        
        <p className="mt-2 max-w-xl text-sm text-foreground/80 sm:text-base">
          {subtitle || dynamicCountText}
        </p>
      </div>
    </section>
  );
}
