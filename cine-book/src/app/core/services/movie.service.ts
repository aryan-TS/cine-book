import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Movie } from '../models/movie.model';
import { environment } from '../environments/environment';

interface MovieSearchResponse {
  Search: Movie[];
  totalResults: string;
  Response: string;
  Error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private readonly apiKey = 'fcbafbe8';
  private readonly baseUrl = 'https://www.omdbapi.com/';
  private backendUrl = `${environment.apiUrl}/movies`;

  constructor(private http: HttpClient) {}

  /**
   * Search for movies with basic query
   */
  searchMovies(query: string, page: number = 1): Observable<Movie[]> {
    const params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('s', query)
      .set('page', page.toString())
      .set('type', 'movie');

    return this.http.get<MovieSearchResponse>(this.baseUrl, { params }).pipe(
      map(response => {
        if (response.Response === 'True') {
          return response.Search || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Search movies error:', error);
        return of([]);
      })
    );
  }

  /**
   * Get detailed information for a specific movie
   */
  getMovieDetails(imdbID: string): Observable<Movie | null> {
    const params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('i', imdbID)
      .set('plot', 'full');

    return this.http.get<Movie>(this.baseUrl, { params }).pipe(
      map(response => {
        if (response.Response === 'True') {
          return response;
        }
        return null;
      }),
      catchError(error => {
        console.error('Get movie details error:', error);
        return of(null);
      })
    );
  }

  /**
   * Search movies by genre (simulate with keywords)
   */
  searchByGenre(genre: string): Observable<Movie[]> {
    const genreQueries: { [key: string]: string } = {
      'Action': 'action',
      'Comedy': 'comedy',
      'Drama': 'drama',
      'Horror': 'horror',
      'Romance': 'romance',
      'Sci-Fi': 'sci-fi',
      'Animation': 'animation',
      'Thriller': 'thriller'
    };

    const query = genreQueries[genre] || genre.toLowerCase();
    return this.searchMovies(query);
  }

  /**
   * Get popular movies (simulate with popular search terms)
   */
  getPopularMovies(): Observable<Movie[]> {
    return this.searchMovies('popular');
  }

  /**
   * Get movies by year
   */
  getMoviesByYear(year: string): Observable<Movie[]> {
    const params = new HttpParams()
      .set('apikey', this.apiKey)
      .set('s', 'movie')
      .set('y', year)
      .set('type', 'movie');

    return this.http.get<MovieSearchResponse>(this.baseUrl, { params }).pipe(
      map(response => {
        if (response.Response === 'True') {
          return response.Search || [];
        }
        return [];
      }),
      catchError(error => {
        console.error('Get movies by year error:', error);
        return of([]);
      })
    );
  }
  getMovies(): Observable<any[]> {
    return this.http.get<any[]>(this.backendUrl);
  }

  addMovie(movie: any): Observable<any> {
    return this.http.post<any>(this.backendUrl, movie);
  }

  deleteMovie(id: string): Observable<any> {
    return this.http.delete<any>(`${this.backendUrl}/${id}`);
  }

  /**
 * Get movies from MongoDB (added by Admin)
 */
getMoviesFromDB(): Observable<Movie[]> {
  return this.http.get<Movie[]>(this.backendUrl).pipe(
    catchError(error => {
      console.error('Error fetching movies from DB:', error);
      return of([]);
    })
  );
}
}
