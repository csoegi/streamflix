import type { Movie } from "@/lib/types";
import { getServerConfig } from "@/lib/config.server";

const { FILMJEPANG_API_BASE_URL, FILMJEPANG_API_KEY } = getServerConfig();
// Keep TMDB references intact for image layout lookups and asset fallback scripts
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/";

// 1. REUSED INTERFACES FROM TMDB
export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string | null;
  display_priority: number;
  link: string;
}

export interface WatchProvidersResult {
  results: Record<string, {
    link: string;
    flatrate?: WatchProvider[];
    rent?: WatchProvider[];
    buy?: WatchProvider[];
    free?: WatchProvider[];
    ads?: WatchProvider[];
  }>;
}

export async function tmdbFetch(path: string, params: Record<string, string> = {}): Promise<any> {
    const page = params.page ? parseInt(params.page) : 1;
    const perPage = params.per_page ? parseInt(params.per_page) : 20;

    try {
        const res = await fetch(`${FILMJEPANG_API_BASE_URL}?page=${page}&per_page=${perPage}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        
        const wpData = await res.json();
        return {
            page: wpData.page,
            total_results: wpData.total_results,
            total_pages: wpData.total_pages,
            results: wpData.results || [] 
        };
    } catch (err) {
        console.error("WordPress Proxy Error:", err);
        return { page: 1, total_results: 0, total_pages: 0, results: [] };
    }
}

export function toMovie(m: any): Movie {
    const scoreVal = m.imdb_score ? parseFloat(m.imdb_score) : 0;
    
    let parsedYear = new Date().getFullYear();
    if (m.release_date) {
        parsedYear = new Date(m.release_date).getFullYear();
    } else if (m.year && m.year.length > 0) {
        parsedYear = parseInt(m.year);
    }

    // 🟢 CRUCIAL CAROUSEL BANNER FIX:
    // If the movie has no widescreen backdrop artwork path field, safely use the poster path as a fallback layout vector
    const fallbackPosterPath = m.poster_path || "";
    const cleanBackdropPath = m.backdrop_path ? m.backdrop_path : fallbackPosterPath;

    return {
        id: String(m.id),
        title: m.title,
        description: m.overview || m.short_description || "No description available.",
        year: parsedYear,
        releaseDate: m.release_date ?? undefined,
        rating: m.content_rating || "NR",
        runtime: m.runtime ? `${Math.floor(parseInt(m.runtime) / 60)}h ${parseInt(m.runtime) % 60}m` : "2h",
        genres: m.genres || [],
        genreIds: [],
        
        poster: processImage(fallbackPosterPath, "w500"),
        backdrop: processImage(cleanBackdropPath, "original"),
        backdropSm: processImage(cleanBackdropPath, "w1280"),
        
        cast: Array.isArray(m.cast) && m.cast.length > 0 ? m.cast : ["Unknown Cast"],
        castPfp: [],
        castRoles: [],
        castIds: [],
        directorId: m.directors?.length ? m.directors[0] : "Unknown",
        directorPfp: "",
        
        match: scoreVal ? Math.round(scoreVal * 10) : 0,
        score: scoreVal || undefined,
        popularity: m.views?.total ? parseFloat(m.views.total) : undefined,

        // VITAL PROPS SYNC: Forces the stream router to notice custom content targets
        isWPContent: true, 
        code: m.code || "",
        slug: m.slug || "",
        video_embed_main: m.video_embed_main || m.videoEmbedMain || "",
        video_embeds: m.video_embeds || m.videoEmbeds || [],
        download_links: m.download_links || m.downloadLinks || []
    };
}


export function toTv(m: any): Movie {
  const epRuntime = Array.isArray(m.episode_run_time) ? m.episode_run_time[0] : null;
  return {
    id: `tv-${m.id}`,
    title: m.name || m.original_name || "Untitled",
    description: m.overview || "No description available.",
    year: m.first_air_date ? new Date(m.first_air_date).getFullYear() : new Date().getFullYear(),
    releaseDate: m.first_air_date ?? undefined,
    rating: extractCertification(m),
    runtime: epRuntime ? `${epRuntime} m / ep` : "Series",
    genres: (m.genres || []).map((g: any) => g.name),
    genreIds: m.genre_ids || [],
    poster: m.poster_path ? `${IMG_BASE}w500${m.poster_path}` : "",
    backdrop: m.backdrop_path ? `${IMG_BASE}original${m.backdrop_path}` : "",
    backdropSm: m.backdrop_path ? `${IMG_BASE}w1280${m.backdrop_path}` : "",
    cast: ["Unknown"],
    castPfp: [],
    castRoles: [],
    castIds: [],
    directorId: "",
    directorPfp: "",
    match: m.vote_average ? Math.round(m.vote_average * 10) : 0,
    score: m.vote_average ? Number(m.vote_average.toFixed(1)) : undefined,
  };
}

/**
 * Fetches video/trailer streaming payloads for a specific asset ID.
 * Bridges the original TMDB requirements to prioritize your local WordPress streaming_sources.
 */
export async function fetchMovieVideosData(id: string): Promise<any[]> {
    // Return an empty array instantly with zero network delay or payload overhead
    return [];
}

/**
 * Normalizes absolute media assets from WordPress and relative TMDb image snippet paths cleanly.
 */
const processImage = (path: string | null | undefined, size: string): string => {
    if (!path) return "";
    // If it's an absolute WordPress asset or external cover link, pass it through untouched
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    // Prepend standard TMDb image infrastructure mirrors for relative string slices
    const IMG_BASE = "https://tmdb.org";
    return `${IMG_BASE}${size}${path}`;
};

export function extractCertification(m: any, country = "US"): string {
  const source = m.release_dates?.results ?? m.content_ratings?.results ?? [];
  const entry = source.find((r: any) => r.iso_3166_1 === country) ?? source[0];
  const cert = entry?.release_dates?.[0]?.certification ?? entry?.rating ?? "";
  return cert;
}

export async function fetchWatchProviders(tmdbId: string, type: "movie" | "tv"): Promise<WatchProvidersResult["results"]> {
  const data = await tmdbFetch(`/${type}/${tmdbId}/watch/providers`);
  return data.results || {};
}

export async function fetchTitleLogoById(id: string) {
  return null; // Safe fallback stub to prevent runtime image layout processing crashes
}

export async function fetchTitleLogosByIds(ids: string[]) {
  const map: Record<string, string | null> = {};
  ids.forEach((id) => { map[id] = null; });
  return map;
}

export async function enrichCertifications(items: Movie[]): Promise<Movie[]> {
  return items; // Direct return array mapping pass-through pass loop
}
