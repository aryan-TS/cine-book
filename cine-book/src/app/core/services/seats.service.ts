import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SeatsResponse {
  bookedSeats: string[];
  seatCapacity?: number;
}

@Injectable({ providedIn: 'root' })
export class SeatsService {
  private baseUrl = 'http://localhost:5000/api/shows';
  constructor(private http: HttpClient) {}

  getBookedSeats(showId: string): Observable<SeatsResponse> {
    return this.http.get<SeatsResponse>(`${this.baseUrl}/${showId}/seats`);
  }

  bookSeats(showId: string, seats: string[]): Observable<{ message: string; bookedSeats: string[] }> {
    return this.http.post<{ message: string; bookedSeats: string[] }>(`${this.baseUrl}/${showId}/seats`, { seats });
  }
}
