import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieAdminService, StoredMovie } from '../../services/movie.service';
import { MovieService } from '../../../core/services/movie.service';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking';
import { Movie } from '../../../core/models/movie.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  recentMovies: StoredMovie[] = [];
  detailedMovies: { [imdbID: string]: Movie | null } = {};

  recentBookings: Booking[] = [];
  totalRevenue: number = 0;

  statusCards = [
    { title: 'Total Movies', value: '0', description: 'Updated dynamically' },
    { title: 'Total Bookings', value: '0', description: 'Updated dynamically' },
    { title: 'Revenue', value: '₹0', description: 'Updated dynamically' },
   
  ];

  constructor(
    private movieAdminService: MovieAdminService,
    private movieService: MovieService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadRecentMovies();
    this.loadRecentBookings();
  }

  loadRecentMovies() {
    this.movieAdminService.getMovies().subscribe({
      next: (movies) => {
        this.recentMovies = movies.slice(0, 4);
        this.statusCards[0].value = movies.length.toString();
        this.fetchMovieDetails();
      },
      error: (err) => console.error('Error loading recent movies:', err)
    });
  }

  fetchMovieDetails() {
    this.recentMovies.forEach((movie) => {
      this.movieService.getMovieDetails(movie.imdbID).subscribe({
        next: (details) => {
          this.detailedMovies[movie.imdbID] = details;
        },
        error: (err) => {
          console.error(`Error fetching details for ${movie.imdbID}:`, err);
          this.detailedMovies[movie.imdbID] = null;
        }
      });
    });
  }

  loadRecentBookings() {
    this.bookingService.getBookings().subscribe({
      next: (bookings) => {
        this.recentBookings = bookings.slice(-5).reverse(); // last 5 bookings
        this.statusCards[1].value = bookings.length.toLocaleString();

        // Calculate total revenue
        this.totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        this.statusCards[2].value = `₹${this.totalRevenue.toLocaleString()}`;
      },
      error: (err) => console.error('Error loading bookings:', err)
    });
  }

  getPoster(imdbID: string): string {
    const details = this.detailedMovies[imdbID];
    return details?.Poster || 'assets/images/default-movie-poster.png';
  }
}
