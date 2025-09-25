// src/app/core/services/showtime.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Showtime {
  id: string;
  movieId: string;
  theatreId: string;
  screenNumber: number;
  showtime: string;
  time?: string; // formatted time for display
  available: boolean;
  price: number;
  date: string;
}

export interface TheatreShowtimes {
  theatre: {
    id: string;
    name: string;
    location: string;
  };
  showtimes: Showtime[];
}

@Injectable({
  providedIn: 'root'
})
export class ShowtimeService {
  private baseUrl = 'http://localhost:5000/api/shows'; // Fixed URL - should match your backend

  constructor(private http: HttpClient) {}

  getShowtimes(movieId: string, date: string): Observable<TheatreShowtimes[]> {
    return this.http.get<TheatreShowtimes[]>(`${this.baseUrl}/showtimes?movieId=${movieId}&date=${date}`);
  }
}
