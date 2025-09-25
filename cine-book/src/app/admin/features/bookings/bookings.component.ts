import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- import this
import { FormsModule } from '@angular/forms'; // <-- for ngModel
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking';

@Component({
  selector: 'app-bookings',
  standalone: true, // <-- mark as standalone
  imports: [CommonModule, FormsModule], // <-- import modules here
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.scss']
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  searchTerm: string = '';

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.bookingService.getBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.filteredBookings = data;
      },
      error: (err) => console.error('Error loading bookings:', err)
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredBookings = this.bookings.filter(b =>
      b.customerName.toLowerCase().includes(term) ||
      b.movieTitle.toLowerCase().includes(term)
    );
  }
}
