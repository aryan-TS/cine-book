import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Movie {
  _id: string;
  imdbID: string;
}

interface Theatre {
  _id: string;
  name: string;
  location: string;
  screens: { screenNumber: number; capacity: number }[];
}

interface Show {
  _id: string;
  movie: Movie | string;   // populated or id
  theatre: Theatre | string; // populated or id
  screenNumber: number;
  showtime: string;
  price: number;
}

@Component({
  selector: 'app-admin-shows',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './shows.component.html',
  styleUrls: ['./shows.component.scss']
})
export class ShowsComponent implements OnInit {
  shows: Show[] = [];
  movies: Movie[] = [];
  theatres: Theatre[] = [];

  // Form state
  movieId: string = '';
  theatreId: string = '';
  screenNumber: number | null = null;
  showtime: string = '';
  price: number | null = null;

  isEditing = false;
  editingShowId: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadShows();
    this.loadMovies();
    this.loadTheatres();
  }

  loadShows() {
    this.http.get<Show[]>('http://localhost:5000/api/shows').subscribe({
      next: (res) => (this.shows = res),
      error: (err) => console.error('Error loading shows:', err),
    });
  }

  loadMovies() {
    this.http.get<Movie[]>('http://localhost:5000/api/movies').subscribe({
      next: (res) => (this.movies = res),
      error: (err) => console.error('Error loading movies:', err),
    });
  }

  loadTheatres() {
    this.http.get<Theatre[]>('http://localhost:5000/api/theatres').subscribe({
      next: (res) => (this.theatres = res),
      error: (err) => console.error('Error loading theatres:', err),
    });
  }

  get selectedTheatreScreens() {
    const t = this.theatres.find(t => t._id === this.theatreId);
    return t?.screens ?? [];
  }

  onTheatreChange() {
    // reset screen selection when theatre changes
    this.screenNumber = null;
  }

  addOrUpdateShow() {
    if (!this.movieId || !this.theatreId || !this.screenNumber || !this.showtime || !this.price) {
      alert('Please fill all fields');
      return;
    }

    const payload = {
      movie: this.movieId,
      theatre: this.theatreId,
      screenNumber: this.screenNumber,
      showtime: this.showtime,
      price: this.price,
    };

    if (this.isEditing && this.editingShowId) {
      this.http.put(`http://localhost:5000/api/shows/${this.editingShowId}`, payload).subscribe({
        next: () => {
          alert('Show updated successfully');
          this.resetForm();
          this.loadShows();
        },
        error: (err) => console.error('Error updating show:', err),
      });
    } else {
      this.http.post('http://localhost:5000/api/shows', payload).subscribe({
        next: () => {
          alert('Show added successfully');
          this.resetForm();
          this.loadShows();
        },
        error: (err) => console.error('Error adding show:', err),
      });
    }
  }

  editShow(show: Show) {
    this.isEditing = true;
    this.editingShowId = show._id;
    // show.movie may be imdbID string or populated object; store imdbID
    if (typeof show.movie === 'string') {
      this.movieId = show.movie; // likely imdbID from backend
    } else {
      this.movieId = (show.movie as Movie)?.imdbID;
    }
    this.theatreId = (typeof show.theatre === 'string') ? show.theatre : (show.theatre as Theatre)._id;
    this.screenNumber = show.screenNumber;
    this.showtime = this.formatForInput(show.showtime);
    this.price = show.price;
  }

  deleteShow(id: string) {
    if (!confirm('Are you sure you want to delete this show?')) return;

    this.http.delete(`http://localhost:5000/api/shows/${id}`).subscribe({
      next: () => {
        alert('Show deleted successfully');
        this.loadShows();
      },
      error: (err) => console.error('Error deleting show:', err),
    });
  }

  getMovieTitle(show: Show): string {
    if (typeof show.movie === 'string') return show.movie; // imdbID
    return (show.movie as Movie)?.imdbID || 'Unknown';
  }

getTheatreName(show: Show): string {
  if (typeof show.theatre === 'string') return show.theatre;
  return (show.theatre as Theatre)?.name || 'Unknown';
}

  resetForm() {
    this.isEditing = false;
    this.editingShowId = null;
    this.movieId = '';
    this.theatreId = '';
    this.screenNumber = null;
    this.showtime = '';
    this.price = null;
  }

  // Convert ISO string to local datetime-local input value (yyyy-MM-ddTHH:mm)
  private pad(n: number) { return n < 10 ? '0' + n : '' + n; }
  formatForInput(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    const year = d.getFullYear();
    const month = this.pad(d.getMonth() + 1);
    const day = this.pad(d.getDate());
    const hours = this.pad(d.getHours());
    const mins = this.pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${mins}`;
  }
}
