export interface Movie {
  _id?: string;
  imdbID: string;
  Title: string;
  Year: string;
  Rated?: string;
  Released?: string;
  Runtime?: string;
  Genre?: string;
  Director?: string;
  Writer?: string;
  Actors?: string;
  Plot?: string;
  Language?: string;
  Country?: string;
  Awards?: string;
  Poster: string;
  Ratings?: Rating[];
  Metascore?: string;
  imdbRating?: string; // Made optional to handle undefined cases
  imdbVotes?: string;
  Type?: string;
  DVD?: string;
  BoxOffice?: string;
  Production?: string;
  Website?: string;
  Response?: string;
}

export interface Rating {
  Source: string;
  Value: string;
}

export interface MovieSearchResponse {
  Search: Movie[];
  totalResults: string;
  Response: string;
  Error?: string;
}

export interface MovieDetails extends Movie {
  // Additional properties that might come from detailed API calls
  totalSeasons?: string;
  seriesID?: string;
  season?: string;
  episode?: string;
}

// Filter interfaces for better type safety
export interface MovieFilters {
  genre?: string;
  year?: string;
  rating?: string;
  sortBy?: 'title' | 'year' | 'rating';
}

export interface SearchParams {
  query?: string;
  year?: string;
  type?: 'movie' | 'series' | 'episode';
  page?: number;
}

// Enum for movie types
export enum MovieType {
  MOVIE = 'movie',
  SERIES = 'series',
  EPISODE = 'episode'
}

// Enum for sort options
export enum SortOption {
  TITLE = 'title',
  YEAR = 'year',
  RATING = 'rating'
}