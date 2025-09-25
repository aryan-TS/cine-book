export interface Booking {
  _id: string;
  user: string;
  customerName: string;
  customerEmail: string;
  movieId: string;
  movieTitle: string;
  theatre: string;
  theatreName: string;
  show: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  bookingDate: string;
}
