// src/app/core/services/theatre.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Theatre {
  _id: string;
  name: string;
  location: string;
  screens: Array<{
    screenNumber: number;
    capacity: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class TheatreService {
  private baseUrl = 'http://localhost:5000/api/theatres'; // Fixed URL

  constructor(private http: HttpClient) {}

  getTheatres(): Observable<Theatre[]> {
    return this.http.get<Theatre[]>(this.baseUrl);
  }
}
