export interface Movie {
  id: string;
  title: string;
  description: string;
  year: number;
  releaseDate?: string;
  rating: string;
  runtime: string;
  genres: string[];
  genreIds: number[];
  poster: string;
  backdrop: string;
  backdropSm: string;
  cast: string[];
  castPfp: string[];
  castRoles: string[];
  castIds: number[];
  director: string;
  directorId: string;
  directorPfp: string;
  match: number;
  score?: number;
  popularity?: number;  
  trailer?: string;
  numberOfSeasons?: number;
  numberOfEpisodes?: number;
  // ADDED FIELDS FOR STREAMFLIX LAYOUT:
  code?: string;
  slug?: string;
  videoEmbedMain?: string;
  video_embed_main?: string;
  videoEmbeds?: Array<{ server_name: string; embed_html: string }>;
  video_embeds?: Array<{ server_name: string; embed_html: string }>;
  downloadLinks?: Array<{ label: string; quality: string; url: string }>;
  download_links?: Array<{ label: string; quality: string; url: string }>;
  seoPath?: string;
}


export type Profile = {
  id: string;
  name: string;
  color: string;
  kids: boolean;
};
