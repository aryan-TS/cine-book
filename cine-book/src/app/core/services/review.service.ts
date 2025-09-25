import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


export interface Review {
  _id?: string;
  movieId: string;
  userId: string;
  rating: number;
  comment: string;
  helpful: number;
  createdAt?: Date;
  updatedAt?: Date;
  user?: {
    _id: string;
    fullName: string;
    email: string;
  };
}

export interface ReviewResponse {
  reviews: Review[];
  totalPages: number;
  currentPage: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) { }

  // Add a new review
  addReview(review: Omit<Review, '_id' | 'createdAt' | 'updatedAt'>): Observable<Review> {
    return this.http.post<Review>(this.apiUrl, review);
  }

  // Get reviews for a specific movie
  getMovieReviews(movieId: string, page: number = 1, limit: number = 10): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.apiUrl}/movie/${movieId}?page=${page}&limit=${limit}`);
  }

  // Get all reviews
  getAllReviews(page: number = 1, limit: number = 10): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  // Update a review
  updateReview(reviewId: string, review: Partial<Review>): Observable<Review> {
    return this.http.put<Review>(`${this.apiUrl}/${reviewId}`, review);
  }

  // Delete a review
  deleteReview(reviewId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${reviewId}`);
  }

  // Mark review as helpful
  markHelpful(reviewId: string): Observable<Review> {
    return this.http.post<Review>(`${this.apiUrl}/${reviewId}/helpful`, {});
  }
}
