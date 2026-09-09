import { Movie } from './types';
import {
  fetchTrending,
  fetchTrendingAllWeek,
  fetchTrendingAllDay,
  fetchPopular,
  fetchNowPlaying,
  fetchTopRated,
  fetchTopRatedTv,
  fetchUpcoming,
  fetchUpcomingTv,
  fetchNewMovies,
  fetchPopularUpcoming,
  fetchPopularUpcomingTv,
  fetchTrendingTv,
  fetchPopularTv,
  fetchAiringTv,
  fetchMovie,
  fetchSimilar,
  fetchRecommendations,
  searchMovies,
  discoverByGenre,
  discoverByGenreMixed,
  searchPeople,
  fetchMovieGenres,
  searchFiltered as searchFilteredFn,
  suggestTitles as suggestTitlesFn,
  type SearchFilterInput,
  type SearchSort,
  fetchUpcomingCalendar,
  fetchAiringCalendar,
  enrichCertifications as enrichCertificationsFn,
  fetchMoviesByGenre,
} from "./api/tmdb";

import { fetchWatchProviders } from "./api/tmdb";
import type { WatchProvider } from "./api/wp.server"; 

export type { Movie };

export type BrowseKind = "home" | "movies" | "tv" | "new";

export const defaultProfiles = [
  { id: "p1", name: "Alex", color: "from-rose-500 to-red-700", kids: false },
  { id: "p2", name: "Jordan", color: "from-sky-500 to-indigo-700", kids: false },
  { id: "p3", name: "Sam", color: "from-amber-400 to-orange-600", kids: false },
  { id: "p4", name: "Kids", color: "from-emerald-400 to-teal-600", kids: true },
];

async function loadHome() {
  const [
    genre1,
    genre2,
    genre3,
    genre4,
    genre5,
    genre6,
    genre7,
    genre8,
    genre9,
    genre10
  ] = await Promise.all([
    discoverByGenre({ data: { genreId: "film-jepang-trending" } }),
    discoverByGenre({ data: { genreId: "jav-populer" } }),
    discoverByGenre({ data: { genreId: "film-jepang-tidak-sensor" } }),
    discoverByGenre({ data: { genreId: "big-tits" } }),    
    discoverByGenre({ data: { genreId: "cosplay" } }),
    discoverByGenre({ data: { genreId: "cheating-wife" } }),  
    discoverByGenre({ data: { genreId: "mature"} }),
    discoverByGenre({ data: { genreId: "older-sister" } }),
    discoverByGenre({ data: { genreId: "soapland" } }),
    discoverByGenre({ data: { genreId: "school-girls" } }),
  ]);

  return {
    heroSlides: await enrichCertificationsFn({ data: { items: genre1.slice(0, 3) } }),
    top10Today: [],
    genreGroups: [],
    rows: [
      { title: "Trending", items: genre1 },
      { title: "Popular", items: genre2 },
      { title: "Uncensored", items: genre3 },
      { title: "Big Tits", items: genre4 },
      { title: "Cosplay", items: genre5 },
      { title: "Cheating Wife", items: genre6 },
      { title: "Mature", items: genre7 },
      { title: "Older Sister", items: genre8 },
      { title: "Soapland", items: genre9 },
      { title: "School Girls", items: genre10 },
    ],
  };
}

async function loadMovies() {
  const [
    genre1,
    genre2,
    genre3,
    genre4,
    genre5,
    genre6,
    genre7,
    genre8,
    genre9,
    genre10
  ] = await Promise.all([
    discoverByGenre({ data: { genreId: "film-jepang-trending" } }),
    discoverByGenre({ data: { genreId: "jav-populer" } }),
    discoverByGenre({ data: { genreId: "film-jepang-tidak-sensor" } }),
    discoverByGenre({ data: { genreId: "big-tits" } }),    
    discoverByGenre({ data: { genreId: "cosplay" } }),
    discoverByGenre({ data: { genreId: "cheating-wife" } }),  
    discoverByGenre({ data: { genreId: "mature"} }),
    discoverByGenre({ data: { genreId: "older-sister" } }),
    discoverByGenre({ data: { genreId: "soapland" } }),
    discoverByGenre({ data: { genreId: "school-girls" } }),
  ]);
  return {
    heroSlides: await enrichCertificationsFn({ data: { items: genre1.slice(0, 3) } }),
    top10Today: [],
    genreGroups: [],
    rows: [
      { title: "Trending", items: genre1 },
      { title: "Popular", items: genre2 },
      { title: "Uncensored", items: genre3 },
      { title: "Big Tits", items: genre4 },
      { title: "Cosplay", items: genre5 },
      { title: "Cheating Wife", items: genre6 },
      { title: "Mature", items: genre7 },
      { title: "Older Sister", items: genre8 },
      { title: "Soapland", items: genre9 },
      { title: "School Girls", items: genre10 },
    ],
  };
}

async function loadTv() {
  const [trending, popular, topRated, airing] = await Promise.all([
    fetchTrendingTv(),
    fetchPopularTv(),
    fetchTopRatedTv(),
    fetchAiringTv(),
  ]);
  return {
    heroSlides: await enrichCertificationsFn({ data: { items: trending.slice(0, 3) } }),
    top10Today: [],
    genreGroups: [],
    rows: [
      { title: "Trending TV", items: trending },
      { title: "Popular Shows", items: popular },
      { title: "Top Rated Series", items: topRated },
      { title: "On the Air Now", items: airing },
    ],
  };
}

async function loadNew() {
  const [
    nowPlaying,  
    trending, 
    newMovies, 
    popularUpcoming, 
    popularTv
  ] = await Promise.all([
      fetchNowPlaying(),
      fetchTrendingAllWeek(),
      fetchNewMovies(),
      fetchPopularUpcoming(),
      fetchPopularUpcomingTv(),
    ]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const seen = new Set<string>();
  const pool = [
    ...((popularUpcoming as Movie[]).length ? popularUpcoming : (upcoming as Movie[])),
    ...((popularTv as Movie[]).length ? popularTv : (upcomingTv as Movie[])),
  ].filter((m) => {
    if (!m.id || seen.has(String(m.id))) return false;
    seen.add(String(m.id));
    return true;
  });
  const comingSoon = pool
    .filter((m) => m.releaseDate && m.releaseDate >= todayStr)
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0) || (a.releaseDate ?? "").localeCompare(b.releaseDate ?? ""))
    .slice(0, 24);

  const featured = (popularUpcoming as Movie[]).length
    ? popularUpcoming
    : comingSoon;

  return {
    heroSlides: await enrichCertificationsFn({ data: { items: featured.slice(0, 3) } }),
    top10Today: [],
    genreGroups: [],
    rows: [
      {
        title: "New Movies",
        items: featured.length
          ? featured
          : newMovies.length
            ? newMovies
            : nowPlaying,
      },
      { title: "Coming Soon", items: comingSoon },
      { title: "Trending This Week", items: trending },
      { title: "New TV Episodes", items: airing },
    ],
  };
}

export async function loadBrowseData(kind: BrowseKind = "home") {
  switch (kind) {
    case "movies":
      return loadMovies();
    case "tv":
      return loadTv();
    case "new":
      return loadNew();
    default:
      return loadHome();
  }
}

export async function movieById(id: string | number): Promise<any> {
  const cleanId = String(id).trim();
  try {
    return await fetchMovie({ data: { id: cleanId } });
  } catch {
    return [];
  }
}

export async function loadSimilar(id: string): Promise<Movie[]> {
  try {
    return await fetchSimilar({ data: { id } });
  } catch {
    return [];
  }
}

export async function loadRecommendations(id: string): Promise<Movie[]> {
  try {
    return await fetchRecommendations({ data: { id } });
  } catch {
    return [];
  }
}

export async function search(query: string): Promise<Movie[]> {
  try {
    return await searchMovies({ data: { query } });
  } catch {
    return [];
  }
}

export async function searchWithFilters(filters: SearchFilterInput): Promise<Movie[]> {
  try {
    return await searchFilteredFn({ data: filters });
  } catch {
    return [];
  }
}

export async function suggestTitles(query: string) {
  try {
    return await suggestTitlesFn({ data: { query } });
  } catch {
    return [];
  }
}

export type { SearchFilterInput, SearchSort };

export async function searchByGenre(genreId: string): Promise<Movie[]> {
  try {
    return await discoverByGenre({ data: { genreId } });
  } catch {
    return [];
  }
}

export async function searchByPerson(query: string) {
  try {
    return await searchPeople({ data: { query } });
  } catch {
    return [];
  }
}

export async function getGenres() {
  try {
    return await fetchMovieGenres();
  } catch {
    return [];
  }
}

export async function loadUpcomingCalendar() {
  try {
    return await fetchUpcomingCalendar();
  } catch {
    return [];
  }
}

export async function loadAiringCalendar() {
  try {
    return await fetchAiringCalendar();
  } catch {
    return [];
  }
}

export async function getWatchProviders(id: string, type: "movie" | "tv" = "movie") {
  try {
    return await fetchWatchProviders({ data: { id, type } });
  } catch {
    return {};
  }
}

export type { WatchProvider };
