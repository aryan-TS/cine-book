import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie } from '../models/movie';

export interface StoredMovie {
  _id: string;
  imdbID: string;
  languages: string[];
  certificate: string;
  priceRange: string;
  releaseDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class MovieAdminService {
  private apiUrl = 'http://localhost:5000/api/movies';

  constructor(private http: HttpClient) {}

  getMovies(): Observable<StoredMovie[]> {
    return this.http.get<StoredMovie[]>(this.apiUrl);
  }
  getMovieById(id: string): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/${id}`);
  }


  addMovie(movieData: any): Observable<any> {
    return this.http.post(this.apiUrl, movieData);
  }

  updateMovie(id: string, movieData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, movieData);
  }

  deleteMovie(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
