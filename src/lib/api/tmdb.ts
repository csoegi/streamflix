import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Movie, MovieList, WPTerm } from "@/lib/types";
import { 
  REST_API_ENDPOINTS, 
  PAGED_LIST_SIZE, 
  MOVIE_SORT_OPTIONS,  
  CACHE_TTL,
  EMPTY_MOVIE_LIST
} from '@/lib/constants';

export const fetchTrendingDay = createServerFn({ method: "POST" }).handler(async () => {
  return fetchMovies({page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.HOT} as any);
});

export const fetchTrendingAllDay = createServerFn({ method: "POST" }).handler(async () => {
  return fetchMovies({page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.HOT} as any);
});

export const fetchTrending = createServerFn({ method: "POST" }).handler(async () => {
  return fetchMovies({page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.TRENDING} as any);
});

export const fetchTrendingAllWeek = createServerFn({ method: "POST" }).handler(async () => {
  return fetchMovies({page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.TRENDING} as any);
});

export const fetchPopular = createServerFn({ method: "POST" }).handler(async () => {
  return fetchMovies({page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.POPULAR} as any);
});

export const fetchNowPlaying = createServerFn({ method: "POST" }).handler(async () => {
  return fetchMovies({page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.NEW} as any);
});

export const fetchTopRated = createServerFn({ method: "POST" }).handler(async () => {
  return fetchMovies({page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.POPULAR} as any);
});

export const fetchNewMovies = createServerFn({ method: "POST" }).handler(async () => {
  return fetchMovies({page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.NEW} as any);
});

export const fetchPopularUpcoming = createServerFn({ method: "POST" }).handler(async () => {
  return fetchMovies({page: 1, per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.NEW} as any);
});

export const fetchMovieGenres = createServerFn({ method: "GET" }).handler(async () => {
  const { getTerms } = await import("./wp.server");
  const data = await getTerms(REST_API_ENDPOINTS.GENRES).catch(() => [] as WPTerm[]) ;
  return data as WPTerm[];
});

export const fetchMovieActors = createServerFn({ method: "GET" }).handler(async () => {
  const { getTerms } = await import("./wp.server");
  const data = await getTerms(REST_API_ENDPOINTS.ACTORS).catch(() => [] as WPTerm[]) ;
  return data as WPTerm[];
});

export const fetchMovieStudios = createServerFn({ method: "GET" }).handler(async () => {
  const { getTerms } = await import("./wp.server");
  const data = await getTerms(REST_API_ENDPOINTS.STUDIOS).catch(() => [] as WPTerm[]) ;
  return data as WPTerm[];
});

export const fetchMovieDirectors = createServerFn({ method: "GET" }).handler(async () => {
  const { getTerms } = await import("./wp.server");
  const data = await getTerms(REST_API_ENDPOINTS.DIRECTORS).catch(() => [] as WPTerm[]) ;
  return data as WPTerm[];
});


export const fetchMovieCountries = createServerFn({ method: "GET" }).handler(async () => {
  const { getTerms } = await import("./wp.server");
  const data = await getTerms(REST_API_ENDPOINTS.COUNTRIES).catch(() => [] as WPTerm[]) ;
  return data as WPTerm[];
});

export const fetchMovieCodes = createServerFn({ method: "GET" }).handler(async () => {
  const { getTerms } = await import("./wp.server");
  const data = await getTerms(REST_API_ENDPOINTS.CODES).catch(() => [] as WPTerm[]) ;
  return data as WPTerm[];
});

export const fetchMovieCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { getTerms } = await import("./wp.server");
  const data = await getTerms(REST_API_ENDPOINTS.CATEGORIES).catch(() => [] as WPTerm[]) ;
  return data as WPTerm[];
});

export const fetchMovieYears = createServerFn({ method: "GET" }).handler(async () => {
  const { getTerms } = await import("./wp.server");
  const data = await getTerms(REST_API_ENDPOINTS.YEARS).catch(() => [] as WPTerm[]) ;
  return data as WPTerm[];
});

export const fetchMovieQualities = createServerFn({ method: "GET" }).handler(async () => {
  const { getTerms } = await import("./wp.server");
  const data = await getTerms(REST_API_ENDPOINTS.QUALITIES).catch(() => [] as WPTerm[]) ;
  return data as WPTerm[];
});

export const fetchMovie = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getMovieById, toMovie } = await import("./wp.server");
    const result = await getMovieById(data.id).catch(() => null);
    if (!result) return null; 
    return toMovie(result);
});

export const fetchMovies = createServerFn({ method: "POST" }) 
  .validator(z.object({ 
    page: z.number().default(1), 
    per_page: z.number().default(PAGED_LIST_SIZE.GRID), 
    sort: z.string().default(MOVIE_SORT_OPTIONS.NEW) 
  }))
  .handler(async ({ data }) => {
    const { getMovies, toMovie } = await import("./wp.server");
    const movieData = await getMovies({ page: String(data.page), per_page: String(data.per_page), sort: data.sort }).catch(() => EMPTY_MOVIE_LIST);
    return {
      page: movieData.page || 1,
      total_pages: movieData.total_pages || 0,
      total_results: movieData.total_results || 0,
      results: (movieData.results || []).map((m: any) => toMovie(m))
    } as MovieList;
});

export const fetchMoviesByGenre = createServerFn({ method: "POST" }) 
  .validator(z.object({ 
    slug: z.string(), 
    page: z.number().default(1), 
    per_page: z.number().default(PAGED_LIST_SIZE.GRID), 
    sort: z.string().default(MOVIE_SORT_OPTIONS.NEW) 
  }))
  .handler(async ({ data }) => {
    const { getMoviesByTerm, toMovie } = await import("./wp.server");
    const movieData = await getMoviesByTerm(REST_API_ENDPOINTS.GENRES, data.slug, { page: String(data.page), per_page: String(data.per_page), sort: data.sort }).catch(() => EMPTY_MOVIE_LIST);
    return {
      page: movieData.page || 1,
      total_pages: movieData.total_pages || 0,
      total_results: movieData.total_results || 0,
      results: (movieData.results || []).map((m: any) => toMovie(m))
    } as MovieList;
});

export const fetchMoviesByActors = createServerFn({ method: "POST" }) 
  .validator(z.object({ 
    slug: z.string(), 
    page: z.number().default(1), 
    per_page: z.number().default(PAGED_LIST_SIZE.GRID), 
    sort: z.string().default(MOVIE_SORT_OPTIONS.NEW) 
  }))
  .handler(async ({ data }) => {
    const { getMoviesByTerm, toMovie } = await import("./wp.server");
    const movieData = await getMoviesByTerm(REST_API_ENDPOINTS.ACTORS, data.slug, { page: String(data.page), per_page: String(data.per_page), sort: data.sort }).catch(() => EMPTY_MOVIE_LIST);
    return {
      page: movieData.page || 1,
      total_pages: movieData.total_pages || 0,
      total_results: movieData.total_results || 0,
      results: (movieData.results || []).map((m: any) => toMovie(m))
    } as MovieList;
});

export const fetchMoviesByCodes = createServerFn({ method: "POST" }) 
  .validator(z.object({ 
    slug: z.string(), 
    page: z.number().default(1), 
    per_page: z.number().default(PAGED_LIST_SIZE.GRID), 
    sort: z.string().default(MOVIE_SORT_OPTIONS.NEW) 
  }))
  .handler(async ({ data }) => {
    const { getMoviesByTerm, toMovie } = await import("./wp.server");
    const movieData = await getMoviesByTerm(REST_API_ENDPOINTS.CODES, data.slug, { page: String(data.page), per_page: String(data.per_page), sort: data.sort }).catch(() => EMPTY_MOVIE_LIST);
    return {
      page: movieData.page || 1,
      total_pages: movieData.total_pages || 0,
      total_results: movieData.total_results || 0,
      results: (movieData.results || []).map((m: any) => toMovie(m))
    } as MovieList;
});

export const fetchMoviesByStudios = createServerFn({ method: "POST" }) 
  .validator(z.object({ 
    slug: z.string(), 
    page: z.number().default(1), 
    per_page: z.number().default(PAGED_LIST_SIZE.GRID), 
    sort: z.string().default(MOVIE_SORT_OPTIONS.NEW) 
  }))
  .handler(async ({ data }) => {
    const { getMoviesByTerm, toMovie } = await import("./wp.server");
    const movieData = await getMoviesByTerm(REST_API_ENDPOINTS.STUDIOS, data.slug, { page: String(data.page), per_page: String(data.per_page), sort: data.sort }).catch(() => EMPTY_MOVIE_LIST);
    return {
      page: movieData.page || 1,
      total_pages: movieData.total_pages || 0,
      total_results: movieData.total_results || 0,
      results: (movieData.results || []).map((m: any) => toMovie(m))
    } as MovieList;
});

export const fetchMoviesByDirectors = createServerFn({ method: "POST" }) 
  .validator(z.object({ 
    slug: z.string(), 
    page: z.number().default(1), 
    per_page: z.number().default(PAGED_LIST_SIZE.GRID), 
    sort: z.string().default(MOVIE_SORT_OPTIONS.NEW) 
  }))
  .handler(async ({ data }) => {
    const { getMoviesByTerm, toMovie } = await import("./wp.server");
    const movieData = await getMoviesByTerm(REST_API_ENDPOINTS.DIRECTORS, data.slug, { page: String(data.page), per_page: String(data.per_page), sort: data.sort }).catch(() => EMPTY_MOVIE_LIST);
    return {
      page: movieData.page || 1,
      total_pages: movieData.total_pages || 0,
      total_results: movieData.total_results || 0,
      results: (movieData.results || []).map((m: any) => toMovie(m))
    } as MovieList;
});

export const searchKeyword = createServerFn({ method: "POST" })
  .validator(z.object({ 
    q: z.string().min(1), 
    page: z.number().default(1), 
    per_page: z.number().default(PAGED_LIST_SIZE.GRID), 
    sort: z.string().default(MOVIE_SORT_OPTIONS.NEW) 
}))
.handler(async ({ data }) => {
  const { searchMovies, toMovie } = await import("./wp.server");
  const movieData = await searchMovies({ q: data.q, page: String(data.page), per_page: String(PAGED_LIST_SIZE.GRID), sort: MOVIE_SORT_OPTIONS.NEW }).catch(() => EMPTY_MOVIE_LIST);
  return {
    page: movieData.page || 1,
    total_pages: movieData.total_pages || 0,
    total_results: movieData.total_results || 0,
    results: (movieData.results || []).map((m: any) => toMovie(m))
  } as MovieList;
});
  
export const searchActors = createServerFn({ method: 'GET' })
  .validator((data: { actorName: string }) => data)
  .handler(async ({ data }) => {
    const actors = await fetchMovieActors();
    const results = actors.filter((item) => item.name.toLowerCase().includes(data.actorName));
    return results;
});

export const fetchUpcoming = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies, toMovie } = await import("./wp.server");
  const [page1, page2] = await Promise.all([
    getMovies({page: "1", per_page: "10"}),
    getMovies({page: "2", per_page: "10"}),
  ]);
  const seen = new Set<string>();
  const all = [...(page1.results || []), ...(page2.results || [])].filter((m: any) => {
    if (!m.id || seen.has(String(m.id))) return false;
    seen.add(String(m.id));
    return true;
  });
  return all.map((m: any) => toMovie(m));
});

export const movieDetailsQueryOptions = (id: string) => ({
  queryKey: ["movie_details", {id}],
  queryFn: () => fetchMovie({data: {id : id}}),
  staleTime: CACHE_TTL.TERMS,
});

export const genreTermsQueryOptions = () => ({
  queryKey: ["terms_genre"],
  queryFn: () => fetchMovieGenres(),
  staleTime: CACHE_TTL.TERMS,
});

export const actorTermsQueryOptions = () => ({
  queryKey: ["terms_actor"],
  queryFn: () => fetchMovieActors(),
  staleTime: CACHE_TTL.TERMS,
});

export const studioTermsQueryOptions = () => ({
  queryKey: ["terms_studio"],
  queryFn: () => fetchMovieStudios(),
  staleTime: CACHE_TTL.TERMS, 
});

export const directorTermsQueryOptions = () => ({
  queryKey: ["terms_director"],
  queryFn: () => fetchMovieDirectors(),
  staleTime: CACHE_TTL.TERMS, 
});

export const serieTermsQueryOptions = () => ({
  queryKey: ["terms_serie"],
  queryFn: () => fetchMovieCodes(),
  staleTime: CACHE_TTL.TERMS,
});

export const browseMoviesQueryOptions = (page: number, sort: string) => ({
  queryKey: ["movies_browse_all", { page, sort }],
  queryFn: () => fetchMovies({ data: { page, sort } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const newMoviesQueryOptions = () => ({
  queryKey: ["movies_highlights_new"],
  queryFn: () => fetchMovies({ data: { page: 1,  per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.NEW } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const hotMoviesQueryOptions = () => ({
  queryKey: ["movies_highlights_hot"],
  queryFn: () => fetchMovies({ data: { page: 1,  per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.HOT } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const trendingMoviesQueryOptions = () => ({
  queryKey: ["movies_highlights_trending"],
  queryFn: () => fetchMovies({ data: { page: 1,  per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.TRENDING } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const popularMoviesQueryOptions = () => ({
  queryKey: ["movies_highlights_popular"],
  queryFn: () => fetchMovies({ data: { page: 1,  per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.POPULAR } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const topRatedMoviesQueryOptions = () => ({
  queryKey: ["movies_highlights_top_rated"],
  queryFn: () => fetchMovies({ data: { page: 1,  per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.TOP_RATED } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const mostViewedMoviesQueryOptions = () => ({
  queryKey: ["movies_highlights_most_viewed"],
  queryFn: () => fetchMovies({ data: { page: 1,  per_page: PAGED_LIST_SIZE.HIGHLIGHT, sort: MOVIE_SORT_OPTIONS.MOST_VIEWED } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const moviesByGenreQueryOptions = (slug: string, page: number, sort: string) => ({
  queryKey: ["movies_genre", { slug, page, sort }], 
  queryFn: () => fetchMoviesByGenre({ data: { slug, page, sort } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const moviesByActorQueryOptions = (slug: string, page: number, sort: string) => ({
  queryKey: ["movies_actor", { slug, page, sort }], 
  queryFn: () => fetchMoviesByActors({ data: { slug, page, sort } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const moviesByStudioQueryOptions = (slug: string, page: number, sort: string) => ({
  queryKey: ["movies_studio", { slug, page, sort }], 
  queryFn: () => fetchMoviesByStudios({ data: { slug, page, sort } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const moviesByDirectorQueryOptions = (slug: string, page: number, sort: string) => ({
  queryKey: ["movies_director", { slug, page, sort }], 
  queryFn: () => fetchMoviesByDirectors({ data: { slug, page, sort } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export const moviesBySerieQueryOptions = (slug: string, page: number, sort: string) => ({
  queryKey: ["movies_serie", { slug, page, sort }], 
  queryFn: () => fetchMoviesByCodes({ data: { slug, page, sort } }),
  staleTime: CACHE_TTL.MOVIES, 
});

export type CalendarTitle = {
  id: string;
  title: string;
  poster: string;
  backdrop: string;
  releaseDate: string;
  year: number;
  genreIds: number[];
  media: "movie" | "tv";
};

export const fetchUpcomingCalendar = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies } = await import("./wp.server");
  const data = await getMovies({page: "1", per_page: "10"});
  return (data.results || []).map((m: any): CalendarTitle => ({
    id: String(m.id),
    title: m.title ?? "",
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : "",
    backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : "",
    releaseDate: m.release_date ?? "",
    year: m.release_date ? new Date(m.release_date).getFullYear() : new Date().getFullYear(),
    genreIds: m.genre_ids || [],
    media: "movie",
  }));
});

export const fetchAiringCalendar = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies } = await import("./wp.server");
  const data = await getMovies({page: "1", per_page: "10"});
  return (data.results || []).map((m: any): CalendarTitle => ({
    id: `tv-${m.id}`,
    title: m.name ?? "",
    poster: m.poster_path ? `https://image.tmdb.org/t/p/w342${m.poster_path}` : "",
    backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : "",
    releaseDate: m.first_air_date ?? "",
    year: m.first_air_date ? new Date(m.first_air_date).getFullYear() : new Date().getFullYear(),
    genreIds: m.genre_ids || [],
    media: "tv",
  }));
});

export const probeEmbedUrl = createServerFn({ method: "POST" })
  .validator(z.object({ url: z.string().url() }))
  .handler(async ({ data }) => {
    try {
      const res = await fetch(data.url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
      });
      return res.ok;
    } catch {
      return false;
    }
  });

// ---- TV ----
export const fetchPopularUpcomingTv = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies, toMovie } = await import("./wp.server");
  const data = await getMovies({page: "1", per_page: "10"}).catch(() => EMPTY_MOVIE_LIST);
  return (data.results || []).map((m: any) => toMovie(m));
});

export const fetchUpcomingTv = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies, toMovie } = await import("./wp.server");
  const data = await getMovies({page: "1", per_page: "10"}).catch(() => EMPTY_MOVIE_LIST);
  return (data.results || []).map((m: any) => toMovie(m));
});


export const fetchTrendingTv = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies, toMovie } = await import("./wp.server");
  const data = await getMovies({page: "1", per_page: "10"}).catch(() => EMPTY_MOVIE_LIST);
  return (data.results || []).map((m: any) => toMovie(m));
});

export const fetchTrendingTvDay = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies, toMovie } = await import("./wp.server");
  const data = await getMovies({page: "1", per_page: "10"}).catch(() => EMPTY_MOVIE_LIST);
  return (data.results || []).map((m: any) => toMovie(m));
});

export const fetchPopularTv = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies, toMovie } = await import("./wp.server");
  const data = await getMovies({page: "1", per_page: "10"}).catch(() => EMPTY_MOVIE_LIST);
  return (data.results || []).map((m: any) => toMovie(m));
});

export const fetchTopRatedTv = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies, toMovie } = await import("./wp.server");
  const data = await getMovies({page: "1", per_page: "10"}).catch(() => EMPTY_MOVIE_LIST);
  return (data.results || []).map((m: any) => toMovie(m));
});

export const fetchAiringTv = createServerFn({ method: "POST" }).handler(async () => {
  const { getMovies, toMovie } = await import("./wp.server");
  const data = await getMovies({page: "1", per_page: "10"}).catch(() => EMPTY_MOVIE_LIST);
  return (data.results || []).map((m: any) => toMovie(m));
});

export const fetchSimilar = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getMovies, toMovie } = await import("./wp.server");
    const movieData = await getMovies({page: "1", per_page: "10"}).catch(() => EMPTY_MOVIE_LIST);
  return (movieData.results || []).map((m: any) => toMovie(m));
  });

export const searchMovies = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { searchMovies, toMovie } = await import("./wp.server");
    const [res1, res2, res3] = await Promise.all([
      searchMovies({ query: data.query, page: "1", per_page: "10" }),
      searchMovies({ query: data.query, page: "2", per_page: "10" }),
      searchMovies({ query: data.query, page: "3", per_page: "10" }),
    ]);
    const combined = [
      ...(res1.results || []),
      ...(res2.results || []),
      ...(res3.results || []),
    ];
    return combined
      .map((m: any) => toMovie(m));
  });

export type SearchSort = "relevance" | "popularity" | "rating" | "year" | "title";

export type SearchFilterInput = {
  query?: string;
  genreId?: number;
  year?: number;
  minRating?: number;
  sort?: SearchSort;
};

function sortRawMovies(list: any[], sort?: SearchSort) {
  switch (sort) {
    case "popularity":
      list.sort((a: any, b: any) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
      break;
    case "rating":
      list.sort((a: any, b: any) => (b.vote_average ?? 0) - (a.vote_average ?? 0));
      break;
    case "year":
      list.sort((a: any, b: any) =>
        String(b.release_date ?? "").localeCompare(String(a.release_date ?? "")),
      );
      break;
    case "title":
      list.sort((a: any, b: any) =>
        String(a.title ?? a.name ?? "").localeCompare(String(b.title ?? b.name ?? "")),
      );
      break;
    default:
      break;
  }
  return list;
}

function dedupeMovies(list: any[]) {
  const seen = new Set<string>();
  return list.filter((m: any) => {
    if (!m.id) return false;
    const key = String(m.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const searchFiltered = createServerFn({ method: "POST" })
  .validator(
    z.object({
      query: z.string().optional().catch(""),
      genreId: z.number().optional().catch(undefined),
      year: z.number().optional().catch(undefined),
      minRating: z.number().optional().catch(undefined),
      sort: z
        .enum(["relevance", "popularity", "rating", "year", "title"])
        .optional()
        .catch(undefined),
    }),
  )
  .handler(async ({ data }) => {
    const { searchMovies, toMovie } = await import("./wp.server");
    const q = (data.query ?? "").trim();

    const sortBy = (sort?: SearchSort) => {
      switch (sort) {
        case "rating":
          return "vote_average.desc";
        case "year":
          return "primary_release_date.desc";
        case "title":
          return "original_title.asc";
        case "popularity":
          return "popularity.desc";
        default:
          return "popularity.desc";
      }
    };

    if (q.length >= 2) {
      const pages = await Promise.all(
        [1, 2, 3, 4].map((p) =>
          searchMovies({
            query: q,
            page: String(p),
            ...(data.year ? { year : String(data.year) } : {}),
          }).catch(() => ({ results: [] })),
        ),
      );
      let list = dedupeMovies(pages.flatMap((r: any) => r.results || []));
      if (data.genreId) {
        list = list.filter((m: any) => (m.genre_ids || []).includes(data.genreId));
      }
      if (data.minRating) {
        list = list.filter((m: any) => (m.vote_average ?? 0) >= (data.minRating ?? 0));
      }
      sortRawMovies(list, data.sort);
      return list.map((m: any) => toMovie(m));
    }

    const params: Record<string, string> = {
      sort_by: sortBy(data.sort),
    };
    if (data.genreId) params.with_genres = String(data.genreId);
    if (data.year) params.primary_release_year = String(data.year);
    if (data.minRating) params["vote_average.gte"] = String(data.minRating);
    const pages = await Promise.all(
      [1, 2, 3, 4].map((p) =>
        searchMovies({ ...params, page: String(p) }).catch(() => ({
          results: [],
        })),
      ),
    );
    return dedupeMovies(pages.flatMap((r: any) => r.results || [])).map((m: any) => toMovie(m));
  });

export const discoverByGenre = createServerFn({ method: "POST" })
  .validator(z.object({ genreId: z.string() }))
  .handler(async ({ data }) => {
    const { getMoviesByTerm, toMovie } = await import("./wp.server");
    const [res1, res2, res3] = await Promise.all([
      getMoviesByTerm(REST_API_ENDPOINTS.GENRES, data.genreId, { page: "1", per_page: "10", sort: MOVIE_SORT_OPTIONS.NEW }),
      getMoviesByTerm(REST_API_ENDPOINTS.GENRES, data.genreId, { page: "2", per_page: "10", sort: MOVIE_SORT_OPTIONS.NEW }),
      getMoviesByTerm(REST_API_ENDPOINTS.GENRES, data.genreId, { page: "3", per_page: "10", sort: MOVIE_SORT_OPTIONS.NEW }),
    ]);
    const combined = [
      ...(res1.results || []),
      ...(res2.results || []),
      ...(res3.results || []),
    ];
    return combined.map((m: any) => toMovie(m));
  });

export const discoverByGenreMixed = createServerFn({ method: "POST" })
  .validator(z.object({ genreId: z.string() }))
  .handler(async ({ data }) => {
    const { getMoviesByTerm, toMovie, toTv } = await import("./wp.server");
    const [movieRes, tvRes] = await Promise.all([
      getMoviesByTerm(REST_API_ENDPOINTS.GENRES, data.genreId, { page: "1", per_page: "10", sort: MOVIE_SORT_OPTIONS.NEW }),
      getMoviesByTerm(REST_API_ENDPOINTS.GENRES, data.genreId, { page: "2", per_page: "10", sort: MOVIE_SORT_OPTIONS.NEW })
    ]);
    const seen = new Set<string>();
    return [...(movieRes.results || []).map((m: any) => toMovie(m)), ...(tvRes.results || []).map((m: any) => toTv(m))].filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  });

export const fetchMoviesByIds = createServerFn({ method: "POST" })
  .validator(z.object({ ids: z.array(z.string()) }))
  .handler(async ({ data }) => {
    const { getMovieById, toMovie } = await import("./wp.server");
    const results: PromiseSettledResult<any>[] = await Promise.allSettled(
      data.ids.map((id: string) =>
        getMovieById(`${id}`),
      ),
    );
    return results
      .filter(
        (r: PromiseSettledResult<any>): r is PromiseFulfilledResult<any> =>
          r.status === "fulfilled",
      )
      .map((r: PromiseFulfilledResult<any>) => toMovie(r.value));
  });

export const fetchRecommendations = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getMovies, toMovie } = await import("./wp.server");
    const res = await getMovies({ id: data.id, page: "1", per_page: "10"});
    return (res.results || []).map((m: any) => toMovie(m));
  });

export const searchPeople = createServerFn({ method: "POST" })
  .validator(z.object({ query: z.string().min(1) }))
  .handler(async ({ data }) => {
    const { searchMovies } = await import("./wp.server");
    const res = await searchMovies({ query: data.query, page: "1", per_page: "10" });
    
    return (res.results || []).map((p: any) => ({
      id: String(p.id),
      name: p.name,
      known_for: (p.known_for || [])
        .map((k: any) => k.title || k.name || "")
        .filter(Boolean)
        .join(", "),
      photo: p.profile_path ? `https://image.tmdb.org/t/p/w185${p.profile_path}` : "",
    }));
  });

export const fetchTvSeason = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), season: z.number() }))
  .handler(async ({ data }) => {
    const { getMovies } = await import("./wp.server");
    return getMovies({ id: data.id, page:"1", per_page:"10"});
  });

export const fetchMovieVideos = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { fetchMovieVideosData } = await import("./wp.server");
    return fetchMovieVideosData(data.id);
  });

export const fetchTitleLogo = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { fetchTitleLogoById } = await import("./wp.server");
    return fetchTitleLogoById(data.id);
  });

export const fetchTitleLogos = createServerFn({ method: "POST" })
  .validator(z.object({ ids: z.array(z.string()).max(30) }))
  .handler(async ({ data }) => {
    const { fetchTitleLogosByIds } = await import("./wp.server");
    return fetchTitleLogosByIds(data.ids);
  });

export const enrichCertifications = createServerFn({ method: "POST" })
  .validator(z.object({ items: z.array(z.any()) }))
  .handler(async ({ data }) => {
    const { enrichCertifications: enrich } = await import("./wp.server");
    return enrich(data.items);
  });

export const fetchPersonDetails = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const { getMovies } = await import("./wp.server");
    const person = await getMovies({ id: data.id });
    const credits = await getMovies({ id: data.id });
    const mapCredit = (c: any) => ({
      id: c.media_type === "tv" ? `tv-${c.id}` : String(c.id),
      title: c.title || c.name || "Untitled",
      character: c.character || "",
      year: c.release_date
        ? new Date(c.release_date).getFullYear()
        : c.first_air_date
          ? new Date(c.first_air_date).getFullYear()
          : null,
      backdrop: c.backdrop_path ? `https://image.tmdb.org/t/p/w780${c.backdrop_path}` : "",
      poster: c.poster_path ? `https://image.tmdb.org/t/p/w342${c.poster_path}` : "",
    });
    return {
      id: String(person.id),
      name: person.name,
      photo: person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : "",
      bio: person.biography || "No biography available.",
      birthday: person.birthday || "",
      deathday: person.deathday || "",
      birthplace: person.place_of_birth || "",
      department: person.known_for_department || "Actor",
      movies: (credits.cast || []).filter((c: any) => c.media_type === "movie").map(mapCredit),
      tvShows: (credits.cast || []).filter((c: any) => c.media_type === "tv").map(mapCredit),
    };
  });

export const fetchWatchProviders = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string(), type: z.enum(["movie", "tv"]).default("movie") }))
  .handler(async ({ data }) => {
    const { fetchWatchProviders: fetch } = await import("./wp.server");
    const tmdbId = data.id.replace(/^tv-/, "");
    return fetch(tmdbId, data.type);
  });
