import { Component, OnInit } from '@angular/core';
import { MovieService } from '../../../core/services/movie.service';
import { MovieAdminService,StoredMovie } from '../../services/movie.service';
import { Movie } from '../../../core/models/movie.model';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-movie',
  standalone: true,
  imports: [FormsModule, DatePipe, CommonModule],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss']
})
export class MoviesComponent implements OnInit {
  movies: StoredMovie[] = [];
  detailedMovies: { [key: string]: Movie | null } = {};
  isLoading = true;

  showModal: boolean = false;
  imdbID: string = '';
  certificate: string = '';
  priceRange: string = '';
  releaseDate: string = '';
  availableLanguages: string[] = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Marathi'];
  selectedLanguages: string[] = [];
  isEditing: boolean = false;
  editingMovieId: string | null = null;

  constructor(
    private movieAdminService: MovieAdminService,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies() {
    this.isLoading = true;
    this.movieAdminService.getMovies().subscribe({
      next: (res) => {
        this.movies = res;
        this.isLoading = false;
        this.fetchOmdbDetails();
      },
      error: (err) => {
        console.error('Error loading movies:', err);
        this.isLoading = false;
      }
    });
  }

  fetchOmdbDetails() {
    this.movies.forEach((movie) => {
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

  openAddMovieModal() {
    this.showModal = true;
    this.resetForm();
  }

  closeModal() {
    this.showModal = false;
    if (this.isEditing) {
      this.resetForm();
    }
  }

  onLanguageChange(event: any, language: string) {
    if (event.target.checked) {
      if (!this.selectedLanguages.includes(language)) {
        this.selectedLanguages.push(language);
      }
    } else {
      const index = this.selectedLanguages.indexOf(language);
      if (index > -1) {
        this.selectedLanguages.splice(index, 1);
      }
    }
  }

  addOrUpdateMovie() {
    if (!this.imdbID.trim()) {
      alert('Please enter a valid IMDb ID');
      return;
    }

    if (this.selectedLanguages.length === 0) {
      alert('Please select at least one language');
      return;
    }

    if (!this.certificate) {
      alert('Please select a certificate');
      return;
    }

    if (!this.priceRange.trim()) {
      alert('Please enter a price range');
      return;
    }

    if (!this.releaseDate) {
      alert('Please select a release date');
      return;
    }

    const priceRangeRegex = /^\d+-\d+$/;
    if (!priceRangeRegex.test(this.priceRange.trim())) {
      alert('Please enter price range in format: 150-300');
      return;
    }

    const movieData = {
      imdbID: this.imdbID.trim(),
      languages: [...this.selectedLanguages],
      certificate: this.certificate,
      priceRange: this.priceRange.trim(),
      releaseDate: this.releaseDate
    };

    if (this.isEditing && this.editingMovieId) {
      this.updateMovie(movieData);
    } else {
      this.addMovie(movieData);
    }
  }

  private addMovie(movieData: any) {
    this.movieAdminService.addMovie(movieData).subscribe({
      next: () => {
        alert('Movie added successfully!');
        this.closeModal();
        this.loadMovies();
      },
      error: (err) => {
        console.error('Error adding movie:', err);
        if (err.error?.message) {
          alert(`Error: ${err.error.message}`);
        } else {
          alert('Error adding movie. Please try again.');
        }
      }
    });
  }

  private updateMovie(movieData: any) {
    if (!this.editingMovieId) return;
    this.movieAdminService.updateMovie(this.editingMovieId, movieData).subscribe({
      next: () => {
        alert('Movie updated successfully!');
        this.closeModal();
        this.loadMovies();
      },
      error: (err) => {
        console.error('Error updating movie:', err);
        if (err.error?.message) {
          alert(`Error: ${err.error.message}`);
        } else {
          alert('Error updating movie. Please try again.');
        }
      }
    });
  }

  editMovie(movie: StoredMovie) {
    this.isEditing = true;
    this.editingMovieId = movie._id;
    this.imdbID = movie.imdbID;
    this.selectedLanguages = [...movie.languages];
    this.certificate = movie.certificate;
    this.priceRange = movie.priceRange;

    if (movie.releaseDate) {
      const date = new Date(movie.releaseDate);
      this.releaseDate = date.toISOString().split('T')[0];
    }

    this.showModal = true;
  }

  deleteMovie(id: string) {
    if (!confirm('Are you sure you want to delete this movie?')) {
      return;
    }

    this.movieAdminService.deleteMovie(id).subscribe({
      next: () => {
        alert('Movie deleted successfully!');
        this.loadMovies();
      },
      error: (err) => {
        console.error('Error deleting movie:', err);
        if (err.error?.message) {
          alert(`Error: ${err.error.message}`);
        } else {
          alert('Error deleting movie. Please try again.');
        }
      }
    });
  }

  resetForm() {
    this.isEditing = false;
    this.editingMovieId = null;
    this.imdbID = '';
    this.selectedLanguages = [];
    this.certificate = '';
    this.priceRange = '';
    this.releaseDate = '';
  }

  onModalBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  onModalContentClick(event: Event) {
    event.stopPropagation();
  }

  getFormattedLanguages(languages: string[]): string {
    if (!languages || languages.length === 0) {
      return 'Not specified';
    }
    return languages.join(', ');
  }

  getCertificateBadgeClass(certificate: string): string {
    switch (certificate?.toUpperCase()) {
      case 'U':
        return 'certificate-u';
      case 'U/A':
        return 'certificate-ua';
      case 'A':
        return 'certificate-a';
      case 'S':
        return 'certificate-s';
      default:
        return 'certificate-default';
    }
  }

  getFormattedPriceRange(priceRange: string): string {
    if (!priceRange) {
      return 'Not specified';
    }
    return `₹${priceRange}`;
  }

  isLanguageSelected(language: string): boolean {
    return this.selectedLanguages.includes(language);
  }

  getMovieYear(imdbID: string): string {
    const details = this.detailedMovies[imdbID];
    return details?.Year || '';
  }

  getMovieRating(imdbID: string): string {
    const details = this.detailedMovies[imdbID];
    return details?.imdbRating || '';
  }

  areMovieDetailsLoaded(imdbID: string): boolean {
    return this.detailedMovies.hasOwnProperty(imdbID) && this.detailedMovies[imdbID] !== null;
  }

  getDefaultPosterUrl(): string {
    return 'assets/images/default-movie-poster.png';
  }
}
