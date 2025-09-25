import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService, BookingData } from '../../core/services/booking.service';
import { OrdersService } from '../../core/services/orders.service';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// PDF generation
import jsPDF from 'jspdf';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  bookingData: BookingData | null = null;
  paymentMethod: string = 'card';
  paymentSuccess: boolean = false;
  ticketId: string = '';

  cardDetails = { number: '', name: '', expiry: '', cvv: '' };
  upiId = '';
  netbankingBank = '';

  get movieTitle(): string {
    return this.bookingData?.movieInfo?.title || '';
  }
  get showTime(): string {
    return this.bookingData?.movieInfo?.showTime || '';
  }
  get screen(): string {
    return this.bookingData?.movieInfo?.screen || '';
  }
  get selectedSeatIds(): string {
    return this.bookingData?.selectedSeats?.map(s => s.id).join(', ') || '';
  }
  get totalAmount(): number {
    return this.bookingData?.totalAmount || 0;
  }
  get movieDate(): string {
    // Try to get date from movieInfo, fallback to bookingDateTime
    const info: any = this.bookingData?.movieInfo;
    if (info && info.date) {
      return info.date;
    }
    if (this.bookingData?.bookingDateTime) {
      const d = new Date(this.bookingData.bookingDateTime);
      return d.toLocaleDateString();
    }
    return '';
  }

  constructor(
    private bookingService: BookingService,
    private orders: OrdersService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.bookingData = this.bookingService.getBookingData();
    if (!this.bookingData) {
      this.router.navigate(['/']);
      return;
    }

    // Double-check showtime is not in the past before payment
    this.validateShowtime();
  }

  private validateShowtime() {
    if (!this.bookingData?.movieInfo?.showTime) return;

    const showTime = new Date(this.bookingData.movieInfo.showTime);
    const now = new Date();

    if (showTime < now) {
      alert('This showtime has already passed. Please select a future showtime.');
      this.router.navigate(['/movies']);
    }
  }

  pay() {
    // Mock payment processing
    setTimeout(() => {
      this.paymentSuccess = true;
      // Persist booking to backend
      this.persistBooking();
    }, 1200);
  }

  private persistBooking() {
    if (!this.bookingData) return;
    const user = this.auth.getUser();
    const customerName = user?.fullName || user?.user?.fullName || user?.name || 'Customer';
    const customerEmail = user?.email || '';

    const payload = {
      userId: user?.id || user?._id || undefined,
      customerName,
      customerEmail,
      movieId: this.bookingData.movieId,
      movieTitle: this.bookingData.movieInfo?.title,
      showId: this.bookingData.showtimeId,
      seats: this.bookingData.selectedSeats?.map(s => s.id) || [],
      totalAmount: this.bookingData.totalAmount,
    };

    this.orders.createBooking(payload).subscribe({
      next: (res: any) => {
        // Use backend-generated Booking ID for ticket display and filename
        // Prefer _id but accept bookingId if API maps it differently
        this.ticketId = res?._id || res?.bookingId || '';
      },
      error: () => {
        // If booking fails, keep ticketId empty so user can't download an invalid ticket
        this.ticketId = '';
      }
    });
  }

  downloadTicket() {
    if (!this.bookingData) return;
    if (!this.ticketId) {
      alert('Your booking is being finalized. Please try again in a moment.');
      return;
    }
    const doc = new jsPDF();
    // Header
    doc.setFillColor(30, 41, 59); // #1e293b
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(16, 185, 129); // #10b981
    doc.setFontSize(22);
    doc.text('CineBook Movie Ticket', 105, 25, { align: 'center' });
    doc.setDrawColor(16, 185, 129);
    doc.line(30, 32, 180, 32);

    // Ticket Info
    doc.setFontSize(14);
    doc.setTextColor(226, 232, 240); // #e2e8f0
    let y = 50;
    const info = [
      [`Booking ID:`, this.ticketId],
      [`Movie:`, this.movieTitle],
      [`Showtime:`, this.showTime],
      [`Date:`, this.movieDate],
      [`Seats:`, this.selectedSeatIds],
      [`Screen:`, this.screen],
      [`Total Paid:`, `Rs.${this.totalAmount}`]
    ];
    info.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 35, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 80, y);
      y += 14;
    });

    // Footer
    doc.setFontSize(11);
    doc.setTextColor(148, 163, 184); // #94a3b8
    doc.text('Thank you for booking with CineBook!', 105, 270, { align: 'center' });

    doc.save(`${this.ticketId || 'ticket'}.pdf`);
  }

  goToHome() {
    this.bookingService.clearBookingData();
    this.router.navigate(['/']);
  }
}
