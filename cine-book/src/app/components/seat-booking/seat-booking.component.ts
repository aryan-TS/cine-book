import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BookingService } from '../../core/services/booking.service';
import { SeatsService } from '../../core/services/seats.service';
import { MovieService } from '../../core/services/movie.service';

interface Seat {
  id: string;
  row: string;
  number: number;
  selected: boolean;
  occupied: boolean;
  premium: boolean;
  price: number;
}

interface MovieInfo {
  title: string;
  genre: string;
  duration: string;
  rating: string;
  showTime: string;
  screen: string;
  audio: string;
  poster?: string;
  theater: string;
}

interface SeatCategory {
  name: string;
  price: number;
}

interface Showtime {
  id: string;
  time: string;
  price: number;
  screenNumber: number;
  theater: string;
}

@Component({
  selector: 'app-seat-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seat-booking.component.html',
  styleUrls: ['./seat-booking.component.scss']
})
export class SeatBookingComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingService = inject<BookingService>(BookingService);
  private movieService = inject(MovieService);
  private seatsService = inject(SeatsService);

  movieId!: string;
  showtimeId!: string;
  basePrice: number = 200; // Default fallback price
  seatCapacity: number = 84; // Default capacity (7 rows × 12 seats)
  premiumPriceAdd: number = 100; // Premium seat additional cost

  movieInfo: MovieInfo = {
    title: '',
    genre: '',
    duration: '',
    rating: '',
    showTime: '',
    screen: '',
    audio: '',
    poster: '',
    theater: ''
  };

  seatCategories: SeatCategory[] = [];
  seats: Seat[] = [];
  selectedSeats: Seat[] = [];

  ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state || history.state;

    if (state?.movieData && state?.showtimeData) {
      const movie = state.movieData;
      const showtime = state.showtimeData;
      
      // Check if showtime is in the past
      const showTime = new Date(showtime.showtime || showtime.time);
      const now = new Date();
      
      console.log('🕐 Checking showtime:', {
        showTime: showTime.toISOString(),
        currentTime: now.toISOString(),
        isPast: showTime < now
      });
      
      if (showTime < now) {
        alert('This showtime has already passed. Please select a future showtime.');
        this.router.navigate(['/movies']);
        return;
      }
      
      // Get pricing from showtime data
      this.basePrice = showtime.price || 200;
      this.seatCapacity = showtime.seatCapacity || 84;
      
      // Update seat categories with database pricing
      this.seatCategories = [
        { name: 'Regular', price: this.basePrice },
        { name: 'Premium', price: this.basePrice + this.premiumPriceAdd }
      ];

      this.movieInfo = {
        title: movie.Title || 'Unknown Title',
        genre: movie.Genre || 'Unknown Genre',
        duration: movie.Runtime || 'Unknown Duration',
        rating: movie.imdbRating || 'N/A',
        showTime: showtime.time || showtime.showtime || '',
        screen: `Screen ${showtime.screenNumber || 1}`,
        audio: movie.Language || 'English',
        poster: movie.Poster || '',
        theater: showtime.theater || showtime.theatreName || 'Unknown Theater'
      };

      // Store IDs for booking
      this.movieId = movie.imdbID;
      this.showtimeId = showtime.id;
    }
    
    this.generateSeats();
    // After seats generation, fetch booked seats from backend and mark occupied
    if (this.showtimeId) {
      this.seatsService.getBookedSeats(this.showtimeId).subscribe({
        next: (res) => {
          if (res.seatCapacity && !isNaN(res.seatCapacity)) {
            this.seatCapacity = res.seatCapacity;
            this.generateSeats();
          }
          const set = new Set(res.bookedSeats || []);
          this.seats.forEach(seat => {
            if (set.has(seat.id)) seat.occupied = true;
          });
        },
        error: () => {
          // ignore; keep default all-free if API fails
        }
      });
    }
  }

  ngOnDestroy() {
    // Cleanup subscriptions if any
  }

  generateSeats() {
    this.seats = [];
    
    // Calculate number of rows based on capacity (12 seats per row)
    const rowsCount = Math.ceil(this.seatCapacity / 12);
    const rows = Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i));
    const seatsPerRow = 12;

    // Define premium rows (last 2 rows)
    const premiumRowsCount = Math.min(2, rowsCount);
    const premiumRows = rows.slice(-premiumRowsCount);

    rows.forEach(row => {
      for (let num = 1; num <= seatsPerRow; num++) {
        // Stop if we exceed total capacity
        const seatIndex = rows.indexOf(row) * seatsPerRow + num;
        if (seatIndex > this.seatCapacity) {
          break;
        }

        const isPremiumRow = premiumRows.includes(row);

        this.seats.push({
          id: `${row}${num}`,
          row: row,
          number: num,
          selected: false,
          occupied: false, // All seats available (no random occupation)
          premium: isPremiumRow,
          price: isPremiumRow ? this.basePrice + this.premiumPriceAdd : this.basePrice
        });
      }
    });
  }

  getRows(): string[] {
    return [...new Set(this.seats.map(s => s.row))];
  }

  getSeatsByRow(row: string): Seat[] {
    return this.seats.filter(s => s.row === row);
  }

  getSeatClass(seat: Seat): string {
    if (seat.occupied) return 'seat occupied';
    if (seat.selected) return 'seat selected';
    if (seat.premium) return 'seat premium available';
    return 'seat available';
  }

  shouldAddAisleSpacing(seatNumber: number): boolean {
    return seatNumber === 3 || seatNumber === 6;
  }

  onSeatClick(seat: Seat) {
    if (seat.occupied) return;

    seat.selected = !seat.selected;
    if (seat.selected) {
      this.selectedSeats.push(seat);
    } else {
      this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    }
  }

  removeSeat(seatId: string) {
    const seat = this.seats.find(s => s.id === seatId);
    if (seat) {
      seat.selected = false;
    }
    this.selectedSeats = this.selectedSeats.filter(s => s.id !== seatId);
  }

  get totalPrice(): number {
    return this.selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  }

  getConvenienceFee(): number {
    return this.selectedSeats.length * 20; // ₹20 per ticket
  }

  getGST(): number {
    return Math.round((this.totalPrice + this.getConvenienceFee()) * 0.18);
  }

  getTotalAmount(): number {
    return this.totalPrice + this.getConvenienceFee() + this.getGST();
  }

  onBackToMovies() {
    this.router.navigate(['/movies']);
  }

  onProceedToPayment() {
    if (this.selectedSeats.length === 0) {
      alert('Please select at least one seat.');
      return;
    }

    // Attempt to lock seats before proceeding
    const seatIds = this.selectedSeats.map(s => s.id);
    this.seatsService.bookSeats(this.showtimeId, seatIds).subscribe({
      next: () => {
        const bookingData = {
          movieId: this.movieId,
          showtimeId: this.showtimeId,
          selectedSeats: this.selectedSeats,
          movieInfo: this.movieInfo,
          totalAmount: this.getTotalAmount(),
          convenienceFee: this.getConvenienceFee(),
          gst: this.getGST(),
          bookingDateTime: new Date()
        };

        this.bookingService.setBookingData(bookingData);
        this.bookingService.saveToLocalStorage(bookingData);

        this.router.navigate(['/payment']);
      },
      error: (err) => {
        alert('Some seats were just booked by someone else. Please reselect.');
        // Refresh booked seats
        this.seatsService.getBookedSeats(this.showtimeId).subscribe(res => {
          const set = new Set(res.bookedSeats || []);
          this.seats.forEach(seat => {
            seat.occupied = set.has(seat.id);
            if (seat.occupied) seat.selected = false;
          });
          this.selectedSeats = this.selectedSeats.filter(s => !s.occupied);
        });
      }
    });
  }
}
