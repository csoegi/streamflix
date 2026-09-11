export const MAIN_VIDEO_URL = "";

export const PAGED_LIST_SIZE = {
  GRID: 35,
  HIGHLIGHT: 10,
} as const;
export type PagedListSize = (typeof PAGED_LIST_SIZE)[keyof typeof PAGED_LIST_SIZE];

export const REST_API_ENDPOINTS = {
  ACTORS: 'actors',
  CODES: 'codes',
  CATEGORIES: 'categories',
  COUNTRIES: 'countries',
  GENRES: 'genres',
  QUALITIES: 'qualities',
  SERIES: 'series',
  STUDIOS: 'studios',
  SEARCH: 'search',
  YEARS: 'years',
} as const;

export type RestApiEndpoints = (typeof REST_API_ENDPOINTS)[keyof typeof REST_API_ENDPOINTS];

export const MOVIE_SORT_OPTIONS = {
  NEW: 'new',
  RELEASE_DATE: 'release_date',
  HOT: 'hot',
  TRENDING: 'trending',
  POPULAR: 'popular'
} as const;

export type MovieSortOptions = (typeof MOVIE_SORT_OPTIONS)[keyof typeof MOVIE_SORT_OPTIONS];

export const CACHE_TTL = {
  TERMS: 1000 * 60 * 30, // 30 mins
  MOVIES: 1000 * 60 * 10, // 10 mins
} as const;
export type CacheTTL = (typeof CACHE_TTL)[keyof typeof CACHE_TTL];