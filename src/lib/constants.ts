
import { MovieList } from "./types";

export const MAIN_VIDEO_URL = "";
export const SEO_SITE_NAME = "Film Jepang";

export const PAGED_LIST_SIZE = {
  GRID: 30,
  HIGHLIGHT: 10,
  SEARCH_SUGGGESTION: 5,
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
  DIRECTORS: 'directors',
  SEARCH: 'search',
  YEARS: 'years',
} as const;

export type RestApiEndpoints = (typeof REST_API_ENDPOINTS)[keyof typeof REST_API_ENDPOINTS];

export const MOVIE_SORT_OPTIONS = {
  NEW: 'new',
  RELEASE_DATE: 'release_date',
  HOT: 'hot',
  TRENDING: 'trending',
  POPULAR: 'popular',
  TOP_RATED: 'top_rated',
  MOST_VIEWED: 'most_viewed'
} as const;

export type MovieSortOptions = (typeof MOVIE_SORT_OPTIONS)[keyof typeof MOVIE_SORT_OPTIONS];

export const CACHE_TTL = {
  TERMS: 1000 * 60 * 30, // 30 mins
  MOVIES: 1000 * 60 * 15, // 15 mins
} as const;
export type CacheTTL = (typeof CACHE_TTL)[keyof typeof CACHE_TTL];

export const EMPTY_MOVIE_LIST: MovieList = {
  page: 1,
  total_pages: 0,
  total_results: 0,
  results: [],
};
export type EmptyMovieList = (typeof EMPTY_MOVIE_LIST)[keyof typeof EMPTY_MOVIE_LIST];