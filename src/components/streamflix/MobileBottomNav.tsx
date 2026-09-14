import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, Film, Bookmark, Send, Grid, X, Tags, Users, Tv, Library } from "lucide-react";

export function MobileBottomNav() {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  return (
    <>
      {/* ========================================================================= */}
      {/* FIXED BOTTOM NAVIGATION BAR BAR                                            */}
      {/* ========================================================================= */}
      {/* md:hidden keeps it strictly visible on mobile screens only */}
      <div className="fixed bottom-0 inset-x-0 h-16 bg-zinc-950/95 border-t border-zinc-900 backdrop-blur-lg z-40 md:hidden flex items-center justify-around px-2 pb-safe shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.9)]">
        
        {/* Menu Item 1: Home */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center w-14 h-full gap-1 transition-all duration-200"
          activeProps={{ className: "text-red-500 font-medium scale-105" }}
          activeOptions={{ exact: true }}
        >
          <Home className="size-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* Menu Item 2: Movies */}
        <Link
          to="/movies"
          className="flex flex-col items-center justify-center w-14 h-full gap-1 transition-all duration-200"
          activeProps={{ className: "text-red-500 font-medium scale-105" }}
        >
          <Film className="size-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight">Movies</span>
        </Link>

        {/* Menu Item 3: Telegram External Resource Anchor Link */}
        <a
          href="https://t.me/KodeNuklirHunter_bot"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center w-14 h-full gap-1 transition-all duration-200"
        >
          <Send className="size-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight">Bot</span>
        </a>

        {/* Menu Item 4: My List */}
        <Link
          to="/mylist"
          className="flex flex-col items-center justify-center w-14 h-full gap-1 transition-all duration-200"
          activeProps={{ className: "text-red-500 font-medium scale-105" }}
        >
          <Bookmark className="size-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight">My List</span>
        </Link>        

        {/* Menu Item 5: More.. Trigger button node link */}
        <button
          type="button"
          onClick={() => setMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center w-14 h-full gap-1 transition-all duration-200 ${
            moreMenuOpen ? "text-red-500 font-medium" : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Grid className="size-5 stroke-[2]" />
          <span className="text-[10px] tracking-tight">More</span>
        </button>

      </div>

      {/* ========================================================================= */}
      {/* MODAL EXPANDABLE BOTTOM DRAWER FOR THE "MORE" TAXONOMY LINKS MENU PANEL     */}
      {/* ========================================================================= */}
      {moreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          {/* Transparent Backdrop backdrop overlay filter masking */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMoreMenuOpen(false)}
          />
          
          {/* Main Slide-Up Action Drawer Core Layout Panel Sheet (Matches styling in Image 2) */}
          <div className="absolute bottom-0 inset-x-0 bg-zinc-950 border-t border-zinc-900 rounded-t-2xl px-6 pt-5 pb-8 flex flex-col space-y-5 animate-slide-up shadow-[0_-25px_50px_-12px_rgba(0,0,0,0.5)]">
            
            {/* Header Pull Down Track Accent */}
            <div className="w-12 h-1 bg-zinc-800 rounded-full self-center -mt-2 mb-2" />
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wider text-zinc-400 uppercase">Explore Collections</h3>
              <button 
                type="button" 
                onClick={() => setMoreMenuOpen(false)}
                className="p-1 rounded-full bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* 2x2 Clean Grid Distribution Links Area for our sub categories */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              
              <Link
                to="/collections/genres"
                onClick={() => setMoreMenuOpen(false)}
                className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl p-3.5 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition"
              >
                <Tags className="size-4.5 text-red-500" />
                <span>Genres</span>
              </Link>

              <Link
                to="/collections/series"
                onClick={() => setMoreMenuOpen(false)}
                className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl p-3.5 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition"
              >
                <Library className="size-4.5 text-red-500" />
                <span>Series</span>
              </Link>

              <Link
                to="/collections/actresses"
                onClick={() => setMoreMenuOpen(false)}
                className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl p-3.5 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition"
              >
                <Users className="size-4.5 text-red-500" />
                <span>Actresses</span>
              </Link>

              <Link
                to="/collections/studios"
                onClick={() => setMoreMenuOpen(false)}
                className="flex items-center gap-3 bg-zinc-900/60 border border-white/5 rounded-xl p-3.5 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition"
              >
                <Tv className="size-4.5 text-red-500" />
                <span>Studios</span>
              </Link>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
