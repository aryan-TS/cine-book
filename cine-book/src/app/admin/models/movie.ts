export interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  releaseDate: Date;
  rating: number;
  poster: string;
  description: string;
  status: 'active' | 'upcoming' | 'offline';
  bookings: number;
  revenue: number;
}
