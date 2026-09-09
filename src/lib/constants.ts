export const MAIN_VIDEO_URL = "";

export const GRID_SIZE_TERM_LIST = 35;

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
