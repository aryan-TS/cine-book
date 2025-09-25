// services/booking.service.ts
import { Injectable, signal } from '@angular/core';

export interface BookingData {
  movieId: string;
  showtimeId: string;
  selectedSeats: Array<{
    id: string;
    price: number;
  }>;
  movieInfo: {
    title: string;
    genre: string;
    duration: string;
    rating: string;
    showTime: string;
    screen: string;
    audio: string;
  };
  totalAmount: number;
  convenienceFee: number;
  gst: number;
  bookingDateTime: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // Using Angular signals for reactive state management
  private bookingDataSignal = signal<BookingData | null>(null);

  // Public readonly signal
  public readonly bookingData = this.bookingDataSignal.asReadonly();

  setBookingData(data: BookingData) {
    this.bookingDataSignal.set(data);
  }

  getBookingData(): BookingData | null {
    return this.bookingDataSignal();
  }

  clearBookingData() {
    this.bookingDataSignal.set(null);
  }

  // Method to save booking data to localStorage as backup
  saveToLocalStorage(data: BookingData) {
    try {
      localStorage.setItem('cinebook_booking_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save booking data to localStorage:', error);
    }
  }

  // Method to load booking data from localStorage
  loadFromLocalStorage(): BookingData | null {
    try {
      const data = localStorage.getItem('cinebook_booking_data');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn('Failed to load booking data from localStorage:', error);
      return null;
    }
  }

  // Clear localStorage data
  clearLocalStorage() {
    try {
      localStorage.removeItem('cinebook_booking_data');
    } catch (error) {
      console.warn('Failed to clear booking data from localStorage:', error);
    }
  }
}