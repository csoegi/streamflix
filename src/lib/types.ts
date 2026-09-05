export interface Movie {
  // --- Core Pre-existing App Shell Fields ---
  id: string; // Numerical post ID converted safely to a string matching TMDB schemas
  title: string;
  description: string; // Standard text property (Maps to WP overview/short_description)
  year: number;        // Clean Integer (Extracted safely from WP array index)
  releaseDate: string;
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
  directorId: string;   // Clean String (Extracted safely from WP directors array index)
  directorPfp: string;
  match: number;
  score?: number;
  popularity?: number;  
  trailer?: string;

  // --- Extended Structural Fields for WordPress Streams Custom Execution ---
  isWPContent?: boolean; // Vital flag separating playback engine components routing path targets
  code?: string;
  slug?: string;
  tags?: string[];
  series?: string[];
  imdb_score?: string;
  vote_count?: number;
  content_rating?: string;
  categories?: string[];
  production_company?: string;
  origin_country?: string[];
  video_quality?: string[];
  video_embed_main?: string;
  video_embeds?: WPServerEmbed[];
  download_links?: WPDownloadLink[];
  views?: {
    today: number;
    weekly: number;
    monthly: number;
    total: number;
  };
  seo?: {
    meta_title: string;
    meta_description: string;
    focus_keywords: string[];
    app_target_url: string;
  };
}

export interface WPServerEmbed {
  server_name: string;
  embed_html: string;
}

export interface WPDownloadLink {
  label: string;
  quality: string;
  url: string;
}
