import React, { useEffect } from "react";
import { z } from "zod";
import { createFileRoute, useLocation,  useNavigate, useRouter } from "@tanstack/react-router";
import { Server, Download, Film, ArrowLeft, Star, Clock, Calendar, Shield } from 'lucide-react';
import { movieById } from "@/lib/streamflix-data";
import { stepsToUsefulBackTarget } from "@/lib/nav-history";
// =========================================================================
// 1. DUAL-SOURCE ROUTER LOADER
// =========================================================================
const watchSearchSchema = z.object({
  season: z.number().optional(),
  episode: z.number().optional(),
  autoplay: z.boolean().optional(),
});

export const Route = createFileRoute("/watch/$id")({
  ssr: false,
  validateSearch: watchSearchSchema,
  loader: async ({ params }) => {
    let movie: any = null;
    try {
      movie = await movieById(params.id);
    } catch (err) {
      console.error("Watch loader failed to fetch content metadata:", err);
    }
    return { 
      movie
    };
  },
  head: ({ loaderData }) => {
    const movie = loaderData?.movie;
    const title = `Watching ${movie?.title ?? "Video"} — StreamFlix`;
    const description = movie?.description
      ? `${movie.description.slice(0, 200)}`
      : "Watch movies and TV shows on StreamFlix.";
    const image = movie?.backdropSm || movie?.poster || "";
    const isTvShow = movie?.id?.startsWith("tv-");

    return {
      meta: [
        { title },
        { name: "description", content: description },
        // OpenGraph Data Engine Mapping
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: image },
        { property: "og:type", content: isTvShow ? "video.tv_show" : "video.movie" },
        // Twitter Card Engine Mapping
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
    };
  },
  component: WatchComponent,
});

// =========================================================================
// 2. MAIN ORCHESTRATION WATCH COMPONENT
// =========================================================================
function WatchComponent() {
  const { movie } = Route.useLoaderData();
  return <WordPressPlayerView movie={movie} />;
}

// =========================================================================
// 3. WORDPRESS DECOUPLED MULTI-SERVER STREAMING PLAYER VIEW
// =========================================================================
function WordPressPlayerView({ movie }: { movie: any }) {
  const [activeServerIndex, setActiveServerIndex] = React.useState(0);
  const [serverDropdownOpen, setServerDropdownOpen] = React.useState(false);
  const [downloadDropdownOpen, setDownloadDropdownOpen] = React.useState(false);
  const [isVideoLoading, setIsVideoLoading] = React.useState(true);
  const currentEmbedHtml = movie.video_embeds?.[activeServerIndex]?.embed_html || movie.video_embed_main || '';

  const navigate = useNavigate();
  const router = useRouter();
  const location = useLocation();
    
  const goBack = () => {
    const steps = stepsToUsefulBackTarget(location.pathname, [`/watch/${movie.id}`]);
    if (steps !== null) {
      router.history.go(-steps);
    } else {
      navigate({ to: `/movies/${movie.id}` }); // Fall back directly to the movie details page
    }
  };

  const getIframeSrc = (htmlString: string): string => {
    const match = htmlString.match(/src=["'](.*?)["']/);
    return match ? match[1] : '';
  };
  
  const videoPlayerUrl = getIframeSrc(currentEmbedHtml);

  useEffect(() => {
    setIsVideoLoading(true);
  }, [activeServerIndex]);

  // 🟢 HIDE GLOBAL ROOT FOOTER & BOTTOM NAV TEMPORARILY DURING VIDEO PLAYBACK
  useEffect(() => {
    const globalNavbar = document.querySelector("header.wco-aware") as HTMLElement | null;
    const globalFooter = document.querySelector("footer") as HTMLElement | null;
    const mobileBottomNav = document.querySelector(".fixed.bottom-0") as HTMLElement | null;

    if (globalNavbar) globalNavbar.style.display = "none";
    if (globalFooter) globalFooter.style.display = "none";
    if (mobileBottomNav) mobileBottomNav.style.display = "none";

    return () => {
      if (globalNavbar) globalNavbar.style.display = "";
      if (globalFooter) globalFooter.style.display = "";
      if (mobileBottomNav) mobileBottomNav.style.display = "";
    };
  }, []);

  return (
  <div className="w-full h-screen bg-black text-zinc-100 antialiased overflow-hidden select-none flex flex-col">

    {/* ========================================================================= */}
    {/* 1. HEADER CONTROLS ROW LAYER (Stays locked at the top)                   */}
    {/* ========================================================================= */}
    <header className="w-full h-14 sm:h-16 bg-zinc-950 border-b border-zinc-900 z-50 flex items-center px-4 md:px-8 justify-between shrink-0">
      
      {/* Back button link element */}
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 text-xs font-semibold hover:text-white hover:bg-zinc-800 transition duration-200 shadow-md backdrop-blur-md"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      {/* Video Title */}
      <span className="hidden sm:block text-xs font-semibold text-zinc-300 max-w-sm md:max-w-md truncate drop-shadow-md">
        {movie.title}
      </span>

      {/* Dropdown switch selections stack */}
      <div className="flex items-center gap-2">
        
        {/* ⚡ SERVERS SWITCHER DROPDOWN BINDING */}
        {movie.video_embeds && movie.video_embeds.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setServerDropdownOpen(!serverDropdownOpen);
                setDownloadDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 text-xs font-semibold hover:text-white transition duration-150 backdrop-blur-md"
            >
              <Server className="w-3.5 h-3.5 text-red-500" />
              <span className="max-w-[80px] truncate">
                {movie.video_embeds[activeServerIndex]?.server_name || "Server"}
              </span>
            </button>

            {serverDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-md z-50 flex flex-col space-y-1">
                {movie.video_embeds.map((srv: any, idx: number) => (
                  <button
                    key={`srv-${idx}`}
                    type="button"
                    onClick={() => {
                      setActiveServerIndex(idx);
                      setServerDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs rounded-lg transition ${
                      activeServerIndex === idx
                        ? "bg-red-600 text-white font-bold"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    {srv.server_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ⚡ DOWNLOADS SELECTION DROPDOWN BINDING */}
        {movie.download_links && movie.download_links.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDownloadDropdownOpen(!downloadDropdownOpen);
                setServerDropdownOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 text-xs font-semibold hover:text-white transition duration-150 backdrop-blur-md"
              >
              <Download className="w-3.5 h-3.5 text-red-500" />
              <span>Download</span>
            </button>

            {downloadDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-md z-50 flex flex-col space-y-1 max-h-60 overflow-y-auto">
                {movie.download_links.map((dl: any, idx: number) => (
                  <a
                    key={`dl-${idx}`}
                    href={dl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDownloadDropdownOpen(false)}
                    className="flex items-center justify-between w-full px-3 py-2 text-left text-xs rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
                  >
                    <span className="truncate mr-2">{dl.label}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase rounded shrink-0">
                      {dl.quality}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </header>

     {/* ========================================================================= */}
      {/* 2. UNIFIED FULL-WIDTH MEDIA CANVAS WRAPPER                                */}
      {/* ========================================================================= */}
      <main className="flex-1 relative w-full bg-black z-10 flex flex-col items-center justify-center overflow-hidden">
        
        {/* Active Loader Screen */}
        {isVideoLoading && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 space-y-4">
            <div className="size-10 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin" />
            <p className="text-xs font-semibold tracking-wider text-zinc-400 animate-pulse uppercase">
              Connecting to media server...
            </p>
          </div>
        )}

        {/* Embedded Video Iframe Player */}
        {videoPlayerUrl ? (
          <iframe
            src={videoPlayerUrl}
            onLoad={() => setIsVideoLoading(false)}
            /* 
              Targeted Math-Bound Fixing Strategy:
              Mobile: Stays centered with 'w-full h-auto aspect-video max-h-full'.
              Desktop (md:): Removes fixed maximum scales (like max-w-5xl) and uses dynamic calc boundaries.
              By locking height to 'max-h-[calc(100vh-64px)]' and width to a proportional 16:9 box 
              'max-w-[calc((100vh-64px)*16/9)]', the video scales perfectly to match your browser depth 
              without ever spilling past the bottom monitor viewport edge!
            */
            className="w-full h-auto aspect-video max-h-full md:w-full md:h-auto md:aspect-video md:max-h-[calc(100vh-64px)] md:max-w-[calc((100vh-64px)*16/9)] border-0 select-none pointer-events-auto shadow-2xl transition-all duration-300"
            allowFullScreen
            scrolling="no"
            sandbox="allow-scripts allow-same-origin allow-forms"
            title={`Streaming Node Server - ${movie.video_embeds?.[activeServerIndex]?.server_name || 'Primary Gateway'}`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 bg-zinc-950 space-y-3">
            <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-850 animate-pulse text-zinc-400">
              <Film className="w-6 h-6 stroke-[1.5]" />
            </div>
            <p className="text-xs font-medium tracking-wide">Connecting with media stream endpoint channels...</p>
          </div>
        )}
      </main>

  </div>
);
}

