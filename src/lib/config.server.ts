export function getServerConfig() {
  return {
    nodeEnv: import.meta.env.MODE,
    tmdbApiKey: import.meta.env.VITE_TMDB_API_KEY ?? import.meta.env.TMDB_API_KEY ?? "",
    FILMJEPANG_API_BASE_URL: import.meta.env.VITE_FILMJEPANG_API_BASE_URL ?? import.meta.env.FILMJEPANG_API_BASE_URL ?? "",
    FILMJEPANG_API_KEY: import.meta.env.VITE_FILMJEPANG_API_KEY ?? import.meta.env.FILMJEPANG_API_KEY ?? "",
  };
}
