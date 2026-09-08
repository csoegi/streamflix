import type { Movie, MovieList, WPTerm } from "@/lib/types";
import { getServerConfig } from "@/lib/config.server";

// Keep TMDB references intact for image layout lookups and asset fallback scripts
const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/";
const { FILMJEPANG_API_BASE_URL, FILMJEPANG_API_KEY } = getServerConfig();

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

interface CacheEntry {
  data: unknown;
  expiry: number;
}

// Instantiate two distinct cache pools
const METADATA_CACHE = new Map<string, CacheEntry>();   // For light items (IDs, terms, slugs)
const GRID_CACHE = new Map<string, CacheEntry>();       // For heavy items (large pages, list arrays)

// Configuration Thresholds
const DEFAULT_TTL = 30 * 60 * 1000;                     // 30 minutes
const METADATA_MAX_SIZE = 5000;                         // Highly beneficial, virtually no RAM footprint
const GRID_MAX_SIZE = 1000;                             // Capped to protect server memory heap

/**
 * Get item from cache (Default: metadata)
 */
export function cacheGet<T>(key: string, type: "metadata" | "grid" = "metadata"): T | undefined {
  const pool = type === "grid" ? GRID_CACHE : METADATA_CACHE;
  const entry = pool.get(key);
  
  if (!entry) return undefined;
  
  // Evict immediately if current epoch passes expiry timestamp
  if (Date.now() > entry.expiry) {
    pool.delete(key);
    return undefined;
  }
  
  return entry.data as T;
}

/**
 * Commits item to cache with FIFO eviction rules based on cache size (Default: metadata)
 */
export function cacheSet(key: string, data: unknown, type: "metadata" | "grid" = "metadata", ttl?: number): void {
  const pool = type === "grid" ? GRID_CACHE : METADATA_CACHE;
  const limit = type === "grid" ? GRID_MAX_SIZE : METADATA_MAX_SIZE;
  const activeTTL = ttl !== undefined ? ttl : DEFAULT_TTL;

  // Enforce structural pool bounds checks (FIFO Eviction)
  if (pool.size >= limit) {
    const oldest = pool.keys().next().value;
    if (oldest !== undefined) pool.delete(oldest);
  }

  // Refresh key position order if it already exists
  if (pool.has(key)) {
    pool.delete(key);
  }

  pool.set(key, { data, expiry: Date.now() + activeTTL });
}

export async function getMovies(params: Record<string, string> = {}): Promise<any> {
    const page = params.page ? parseInt(params.page) : 1;
    const perPage = params.per_page ? parseInt(params.per_page) : 35;

    try {
        const res = await fetch(`${FILMJEPANG_API_BASE_URL}?page=${page}&per_page=${perPage}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!res.ok) throw new Error(`HTTP Code ${res.status}`);

        const data = await res.json();

        return {
            page: data.page,
            total_results: data.total_results || 0,
            total_pages: data.total_pages || 1,
            results: data.results || [] 
        };
    } catch (err) {
        console.error("[API ERROR] [wp.server->getMovies]: ", err);
    }
    
    return { page: 1, total_results: 0, total_pages: 0, results: [] };
}

export async function getMovieById(id: string): Promise<any> {
    try {
        const cacheKey = `meta_movie_${id}`;
        const cached = cacheGet<Movie>(cacheKey); 
        if (cached) return cached;

        const res = await fetch(`${FILMJEPANG_API_BASE_URL}/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);        
        var data = await res.json();
        cacheSet(cacheKey, data);
        return data;
    } 
    catch (err) {
        console.error("[API ERROR] [wp.server->getMovieById]: ", err);
    }
    return null;
}

export async function getGenres(): Promise<any[]> {
    try {
        const cacheKey = "meta_genres";
        const cached = cacheGet<WPTerm[]>(cacheKey); 
        if (cached) return cached;

        const res = await fetch(`${FILMJEPANG_API_BASE_URL}/genres`, {
            method: "GET",
            headers: {
            "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
            "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`HTTP Code: ${res.status}`);
        var data = await res.json();
        cacheSet(cacheKey, data);
        return data;
    } 
    catch (err) {
      console.error("[API ERROR] [wp.server->getGenres]: ", err);
    }
    return [];
}

export async function getMoviesByGenre(genreSlug: string, params: Record<string, string> = {}): Promise<any> {
    try {
        const page = params.page ? parseInt(params.page) : 1;
        const perPage = params.per_page ? parseInt(params.per_page) : 35;
        const cacheKey = `genres_${genreSlug}_${page}_${perPage}`;
        const cached = cacheGet<any>(cacheKey, "grid");
        if (cached) return cached;

        const res = await fetch(`${FILMJEPANG_API_BASE_URL}/genres/${genreSlug}?page=${page}&per_page=${perPage}`, {
            method: "GET",
            headers: {
            "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
            "Content-Type": "application/json"
            }
        });
        if (!res.ok) throw new Error(`HTTP Code ${res.status}`);
      
        const data = await res.json();
        cacheSet(cacheKey, data, "grid");
        return {
            page: data.page,
            total_results: data.total_results || 0,
            total_pages: data.total_pages || 1,
            results: data.results || [] 
        };
    } 
    catch (err) {
      console.error("[API ERROR] [wp.server->getMoviesByGenre]: ", err);
    }
    return { page: 1, total_results: 0, total_pages: 0, results: [] };
}

export async function searchMovies(params: Record<string, string> = {}): Promise<any> {
    const query = params.q ? parseInt(params.q) : "";
    const page = params.page ? parseInt(params.page) : 1;
    const perPage = params.per_page ? parseInt(params.per_page) : 35;

    try {
        const res = await fetch(`${FILMJEPANG_API_BASE_URL}/search?q=${query}page=${page}&per_page=${perPage}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${FILMJEPANG_API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!res.ok) throw new Error(`HTTP Code ${res.status}`);

        const data = await res.json();

        return {
            page: data.page,
            total_results: data.total_results || 0,
            total_pages: data.total_pages || 1,
            results: data.results || [] 
        };
    } catch (err) {
        console.error("[API ERROR] [wp.server->searchMovies]: ", err);
    }
    
    return { page: 1, total_results: 0, total_pages: 0, results: [] };
}

export function toMovie(m: any): Movie {
    const scoreVal = m.imdb_score ? parseFloat(m.imdb_score) : 0;
    
    let releaseYear = new Date().getFullYear();
    if (m.release_date) {
        releaseYear = new Date(m.release_date).getFullYear();
    } else if (m.year && m.year.length > 0) {
        releaseYear = parseInt(m.year);
    }

    // 🟢 CAROUSEL BANNER FIX:
    // If the movie has no widescreen backdrop image, use the poster path as a fallback
    const posterImagePath = m.poster_path || "";
    const backdropImagePath = m.backdrop_path ? m.backdrop_path : posterImagePath;

    return {
        // === CORE METADATA
        id: String(m.id),
        code: m.code || "",
        slug: m.slug || "",
        title: m.title || "Untitled",
        description: m.short_description || m.overview || "No description available.",
        year: releaseYear,
        releaseDate: m.release_date ?? undefined,
        rating: m.content_rating || "NR",
        runtime: m.runtime ? `${Math.floor(parseInt(m.runtime) / 60)}h ${parseInt(m.runtime) % 60}m` : "2h",
        video_quality: m.video_quality || [],
        // === IMAGES        
        poster: posterImagePath,
        backdrop: backdropImagePath,
        backdropSm: backdropImagePath,
        // === ACTORS
        cast: Array.isArray(m.cast) && m.cast.length > 0 ? m.cast : ["Unknown Cast"],
        castPfp: [],
        castRoles: [],
        castIds: [],
        // === DIRECTOR
        director: m.directors?.length ? m.directors[0] : "Unknown",
        directorId: m.directors?.length ? m.directors[0] : "Unknown",
        directorPfp: "",
        // === PRODUCTION
        production_company: m.production_company || "",
        origin_country: m.origin_country || [],
        // === TAXONOMY
        categories: m.categories || [],
        tags: m.tags || [],
        series: m.series || [],
        genres: m.genres || [],
        genreIds: [],
        // === VIDEO EMBEDS & DOWNLOAD LINKS
        video_embed_main: m.video_embed_main || m.videoEmbedMain || "",
        video_embeds: m.video_embeds || m.videoEmbeds || [],
        download_links: m.download_links || m.downloadLinks || [],
        // === SCORING
        match: scoreVal ? Math.round(scoreVal * 10) : 0,
        score: scoreVal || undefined,
        popularity: m.views?.total ? parseFloat(m.views.total) : undefined,
        vote_count: m.vote_count ? parseInt(m.vote_count) : undefined,
        imdb_score: m.imdb_score || undefined,
    
        // === STATS
        views: {
            today: m.views?.today ? parseInt(m.views.today) : 0,
            weekly: m.views?.weekly ? parseInt(m.views.weekly) : 0,
            monthly: m.views?.monthly ? parseInt(m.views.monthly) : 0,
            total: m.views?.total ? parseInt(m.views.total) : 0,
        },
        // === SEO
        seo: {
            meta_title: m.seo?.meta_title || "",
            meta_description: m.seo?.meta_description || "",
            focus_keywords: m.seo?.focus_keywords || [],
            app_target_url: m.seo?.app_target_url || "",
        },
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

export async function fetchMovieVideosData(id: string): Promise<any[]> {
    // Return an empty array instantly with zero network delay or payload overhead
    return [];
}

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
  const data = await getMovies();
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
