import { Download, Send, Disc } from "lucide-react"; 
import { Link } from "@tanstack/react-router";
import { isInApp } from "@/lib/app-downloads";
import { Logo } from "@/components/streamflix/Logo";
import { SEO_SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 px-4 sm:px-8 md:px-12 py-12 text-sm text-zinc-400">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* ========================================================================= */}
        {/* 🟢 MAIN 2-COLUMN GRID GRID PIPELINE                                        */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
          
          {/* 👈 COLUMN 1: BRAND LOGO & SYSTEM DISCLAIMER TEXT BLOCK */}
          <div className="flex flex-col space-y-4 min-w-0">
            <Logo className="text-xl sm:text-2xl" />
            <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed text-justify md:text-left">
              {SEO_SITE_NAME} - Situs Streaming Film Jepang Sub Indonesia Terlengkap, here you can watch movies online in high quality for free without annoying of advertising, just come and enjoy your movies online.
            </p>
            <p className="text-[11px] sm:text-xs text-zinc-600 leading-relaxed text-justify md:text-left pt-3 border-t border-zinc-900/60">
              <span className="font-semibold text-zinc-500 uppercase tracking-wider text-[10px] block mb-1">Disclaimer:</span>
              Copyrights and trademarks for the movies and tv series, and other promotional materials are held by their respective owners and their use is allowed under the fair use clause of the Copyright Law. All Series Videos are hosted on sharing website, and provided by 3rd parties not affiliated with this site or it's server.
            </p>
          </div>

          {/* 👉 COLUMN 2: UTILITIES PANEL (Links, Socials, and App Downloads stacked) */}
          <div className="flex flex-col space-y-6 md:pl-6 md:border-l border-zinc-900/50">
            
            {/* SUB-SECTION A: Static Pages Links */}
            <div className="flex flex-col space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Legal</h4>
              <nav className="flex flex-wrap md:flex-col gap-x-4 gap-y-2 text-xs text-zinc-400">
                <Link to="/tos" className="hover:text-white transition-colors w-fit">
                  Terms of Service
                </Link>
                <Link to="/privacy-policy" className="hover:text-white transition-colors w-fit">
                  Privacy Policy
                </Link>
              </nav>
            </div>

            {/* SUB-SECTION B: Social Media Communication Nodes */}
            <div className="flex flex-col space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Community</h4>
              <div className="flex items-center gap-5 text-xs text-zinc-400">
                <a
                  href="https://t.me/infofilmjepang" // Replace with your real Telegram URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                  aria-label="Join Telegram group"
                >
                  <Send className="size-4 text-red-500" />
                  <span>Telegram</span>
                </a>

                <a
                  href="https://t.me/KodeNuklirHunter_bot" // Replace with your real Discord URL
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                  aria-label="Open Telegram Bot"
                >
                  <Send className="size-4 text-red-500" />
                  <span>Kode Nuklir Bot</span>
                </a>
              </div>
            </div>

            {/* SUB-SECTION C: Native App Download Call (Conditional block render) */}
            {!isInApp() && (
              <div className="flex flex-col space-y-2 pt-2 border-t border-zinc-900/40">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Applications</h4>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 w-full sm:w-fit"
                >
                  <Download className="size-3.5" />
                  <span>Download Mobile Client</span>
                </a>
              </div>
            )}

          </div>
        </div>
      </div>
      <div className="w-full border-t border-zinc-900 mt-12 pt-6 px-4 sm:px-8 md:px-12">
        <div className="mx-auto max-w-6xl flex items-center justify-center text-center gap-2">
          <p className="text-xs text-zinc-600 font-medium tracking-wide">
            Copyright &copy; {new Date().getFullYear()} {SEO_SITE_NAME}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
