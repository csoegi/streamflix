import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Server, Download, Film, ArrowLeft, Star, Clock, Calendar, Shield } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { movieById } from "@/lib/streamflix-data";
import { z } from "zod";

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
  // FIX: Replaced custom seoMetaFor wrapper with clean standard metadata generation
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
  
  const currentEmbedHtml = movie.video_embeds?.[activeServerIndex]?.embed_html || movie.video_embed_main || '';

  // Extract the src URL from the raw iframe HTML string safely via clean text regex regex matching
  const getIframeSrc = (htmlString: string): string => {
    const match = htmlString.match(/src=["'](.*?)["']/);
    return match ? match[1] : '';
  };

  const videoPlayerUrl = getIframeSrc(currentEmbedHtml);

  return (
    <div className="min-h-screen bg-[#040406] text-zinc-100 antialiased font-sans pb-16 selection:bg-white selection:text-black">
      
      {/* Dynamic Header Floating Action Strip Layout bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-[2px] z-50 flex items-center px-4 md:px-8 justify-between border-b border-zinc-950/20">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-xs font-semibold hover:text-white hover:bg-zinc-850 hover:border-zinc-700 transition duration-200 shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
        </Link>
        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] tracking-wider uppercase bg-zinc-950/80 px-2.5 py-1 rounded-md border border-zinc-900">
          <Shield className="w-3 h-3 text-emerald-500" /> Secure WP Gateway Stream
        </div>
      </header>

      {/* Main Grid Payload Media Wrapper Frame */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-24 space-y-8">
        
        {/* Dynamic Video Player Window Canvas Object */}
        <div className="relative aspect-video w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-900 shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)]">
          {videoPlayerUrl ? (
            <iframe
              src={videoPlayerUrl}
              className="absolute top-0 left-0 w-full h-full border-0 select-none"
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
              <p className="text-xs font-medium tracking-wide">Awaiting connection with media endpoint streaming channels...</p>
            </div>
          )}
        </div>

        {/* Dynamic Dashboard Split Control Panel Columns Layout maps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column Group A: Metadata Context Summaries Text */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {movie.title}
              </h1>
              
              {/* Badges strip blocks */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {movie.code && (
                  <span className="px-2.5 py-0.5 text-[11px] font-bold bg-zinc-900 text-amber-400 rounded-md border border-zinc-800 uppercase tracking-wider font-mono">
                    {movie.code}
                  </span>
                )}
                {movie.year && (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-zinc-900 text-zinc-300 rounded-md border border-zinc-800 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" /> {movie.year}
                  </span>
                )}
                {movie.runtime && (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-zinc-900 text-zinc-300 rounded-md border border-zinc-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-400" /> {movie.runtime}
                  </span>
                )}
                {movie.imdb_score && (
                  <span className="px-2 py-0.5 text-[11px] font-bold bg-zinc-900 text-emerald-400 rounded-md border border-zinc-800 flex items-center gap-1 font-mono">
                    <Star className="w-3 h-3 fill-emerald-500/10 stroke-[2]" /> {movie.imdb_score}
                  </span>
                )}
              </div>
            </div>

            <hr className="border-zinc-900 my-2" />

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Synopsis Overview</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-normal">
                {movie.description}
              </p>
            </div>
          </div>

          {/* Column Group B: Cloud Distribution Networking Nodes (Servers & Downloads Selection) */}
          <div className="space-y-5 bg-zinc-950/60 p-5 rounded-2xl border border-zinc-900 shadow-sm backdrop-blur-sm">
            
            {/* Dynamic Server Selection Panels layout */}
            {movie.video_embeds && movie.video_embeds.length > 0 ? (
              <div className="space-y-3">
                <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-zinc-400" /> Available Processing Streams
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {movie.video_embeds.map((srv: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveServerIndex(idx)}
                      className={`w-full px-4 py-3 text-left text-xs font-semibold rounded-xl border transition-all duration-200 outline-none ${
                        activeServerIndex === idx
                          ? 'bg-white text-black border-white shadow-md font-bold scale-[1.005]'
                          : 'bg-zinc-900/60 text-zinc-300 border-zinc-850 hover:bg-zinc-900 hover:border-zinc-700 hover:text-white'
                      }`}
                    >
                      {srv.server_name}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-zinc-600 text-xs py-2 italic font-normal">
                No extra cloud distribution infrastructure nodes found. Relying on baseline gateway player stream settings.
              </div>
            )}

            {/* Downloader file targets layout grid box */}
            {movie.download_links && movie.download_links.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-zinc-900">
                <span className="text-[10px] font-bold tracking-widest text-zinc-500 uppercase flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-zinc-400" /> Storage Downloads Mirrors
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {movie.download_links.map((dl: any, idx: number) => (
                    <a
                      key={idx}
                      href={dl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between w-full px-4 py-3 bg-zinc-900/30 border border-zinc-850 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700 hover:text-white transition duration-150 shadow-inner group"
                    >
                      <span className="truncate group-hover:translate-x-0.5 transition duration-150">{dl.label}</span>
                      <span className="text-[9px] font-mono font-bold tracking-wide px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800 text-zinc-400 uppercase">
                        {dl.quality}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </main>
    </div>
  );
}
