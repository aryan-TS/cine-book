import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../../../core/services/movie.service';
import { Movie } from '../../../core/models/movie.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss'
})
export class MovieListComponent implements OnInit, OnDestroy {
  movies: Movie[] = [];
  filteredMovies: Movie[] = [];
  isLoading: boolean = false;
  
  // Search and filter properties
  searchQuery: string = '';
  selectedGenre: string = '';
  selectedYear: string = '';
  selectedRating: string = '';
  sortBy: string = 'title';
  
  // Available filter options
  availableGenres: string[] = [];
  availableYears: string[] = [];
  
  // Search debouncing
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();
  
  // Watchlist functionality
  watchlist: Set<string> = new Set();

  // Inject Router
  private router = inject(Router);

  constructor(private movieService: MovieService) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.trim()) {
        this.performSearch();
      }
    });
  }

  ngOnInit(): void {
    this.loadInitialMovies();
    this.loadWatchlistFromStorage();
    console.log('MovieListComponent initialized');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialMovies(): void {
  this.isLoading = true;

  this.movieService.getMoviesFromDB().subscribe({
    next: (dbMovies) => {
      const detailCalls = dbMovies.map(dbMovie =>
        this.movieService.getMovieDetails(dbMovie.imdbID)
      );

      Promise.all(detailCalls.map(obs => obs.toPromise()))
        .then((movies) => {
          this.movies = movies.filter(m => m !== null) as Movie[];
          this.extractFilterOptions();
          this.applyFilters();
          this.isLoading = false;
        })
        .catch(err => {
          console.error('Error fetching movie details:', err);
          this.movies = [];
          this.filteredMovies = [];
          this.isLoading = false;
        });
    },
    error: (err) => {
      console.error('Error fetching movies from DB:', err);
      this.isLoading = false;
    }
  });
}


  onSearchInput(event: any): void {
    const query = event.target.value;
    this.searchSubject.next(query);
  }

  performSearch(): void {
    this.applyFilters();
  }

  extractFilterOptions(): void {
    const genres = new Set<string>();
    const years = new Set<string>();

    this.movies.forEach(movie => {
      if (movie.Genre && movie.Genre !== 'N/A') {
        movie.Genre.split(',').forEach(genre => {
          genres.add(genre.trim());
        });
      }

      if (movie.Year && movie.Year !== 'N/A') {
        years.add(movie.Year);
      }
    });

    this.availableGenres = Array.from(genres).sort();
    this.availableYears = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }

  applyFilters(): void {
    let filtered = [...this.movies];

    if (this.searchQuery.trim()) {
      const lowerQuery = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(movie =>
        movie.Title?.toLowerCase().includes(lowerQuery)
      );
    }

    if (this.selectedGenre) {
      filtered = filtered.filter(movie =>
        movie.Genre && movie.Genre.toLowerCase().includes(this.selectedGenre.toLowerCase())
      );
    }

    if (this.selectedYear) {
      filtered = filtered.filter(movie => movie.Year === this.selectedYear);
    }

    if (this.selectedRating) {
      const minRating = parseFloat(this.selectedRating);
      filtered = filtered.filter(movie => {
        if (!movie.imdbRating || movie.imdbRating === 'N/A') return false;
        const rating = parseFloat(movie.imdbRating);
        return !isNaN(rating) && rating >= minRating;
      });
    }

    filtered = this.sortMovies(filtered);

    this.filteredMovies = filtered;
  }

  sortMovies(movies: Movie[]): Movie[] {
    return movies.sort((a, b) => {
      switch (this.sortBy) {
        case 'title':
          return a.Title.localeCompare(b.Title);
        case 'year':
          return parseInt(b.Year) - parseInt(a.Year);
        case 'rating':
          const ratingA = a.imdbRating && a.imdbRating !== 'N/A' ? parseFloat(a.imdbRating) : 0;
          const ratingB = b.imdbRating && b.imdbRating !== 'N/A' ? parseFloat(b.imdbRating) : 0;
          return ratingB - ratingA;
        default:
          return 0;
      }
    });
  }

  clearFilters(): void {
    this.selectedGenre = '';
    this.selectedYear = '';
    this.selectedRating = '';
    this.sortBy = 'title';
    this.applyFilters();
  }

  onImageError(event: any): void {
    event.target.src = 'assets/placeholder.jpg';
  }

  goToDetails(imdbID: string): void {
    this.router.navigate(['/movies', imdbID]);
  }

  toggleWatchlist(movie: Movie): void {
    if (this.watchlist.has(movie.imdbID)) {
      this.watchlist.delete(movie.imdbID);
    } else {
      this.watchlist.add(movie.imdbID);
    }
    this.saveWatchlistToStorage();
  }

  isInWatchlist(imdbID: string): boolean {
    return this.watchlist.has(imdbID);
  }

  loadWatchlistFromStorage(): void {
    try {
      const stored = localStorage.getItem('movieWatchlist');
      if (stored) {
        const watchlistArray = JSON.parse(stored);
        this.watchlist = new Set(watchlistArray);
      }
    } catch (error) {
      console.error('Error loading watchlist from storage:', error);
    }
  }

  saveWatchlistToStorage(): void {
    try {
      const watchlistArray = Array.from(this.watchlist);
      localStorage.setItem('movieWatchlist', JSON.stringify(watchlistArray));
    } catch (error) {
      console.error('Error saving watchlist to storage:', error);
    }
  }

  trackByMovieId(index: number, movie: Movie): string {
    return movie.imdbID;
  }

  getMoviesCountText(): string {
    const total = this.movies.length;
    const filtered = this.filteredMovies.length;

    if (total === filtered) {
      return `${total} movie${total !== 1 ? 's' : ''}`;
    }
    return `${filtered} of ${total} movie${total !== 1 ? 's' : ''}`;
  }

  loadMoreMovies(): void {
    if (this.isLoading) return;

    const additionalQueries = ['thriller', 'horror', 'romance', 'sci-fi', 'animation'];
    const randomQuery = additionalQueries[Math.floor(Math.random() * additionalQueries.length)];

    this.isLoading = true;

    this.movieService.searchMovies(randomQuery).subscribe({
      next: (res: Movie[]) => {
        if (res && res.length > 0) {
          const newMovies = res.filter(newMovie =>
            !this.movies.some(existingMovie => existingMovie.imdbID === newMovie.imdbID)
          );

          this.movies = [...this.movies, ...newMovies];
          this.extractFilterOptions();
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading more movies:', err);
        this.isLoading = false;
      }
    });
  }

  getPlaceholderImage(): string {
    return 'assets/placeholder.jpg';
  }

  formatRuntime(runtime: string): string {
    if (!runtime || runtime === 'N/A') return '';
    return runtime.replace('min', 'm');
  }

  getGenreBadgeColor(genre: string): string {
    const colors = {
      'Action': '#ef4444',
      'Adventure': '#f59e0b',
      'Comedy': '#10b981',
      'Drama': '#6366f1',
      'Horror': '#7c2d12',
      'Romance': '#ec4899',
      'Sci-Fi': '#06b6d4',
      'Thriller': '#8b5cf6'
    };

    return colors[genre as keyof typeof colors] || '#64748b';
  }

  exportWatchlist(): void {
    const watchlistMovies = this.movies.filter(movie => this.watchlist.has(movie.imdbID));
    const dataStr = JSON.stringify(watchlistMovies, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'my-watchlist.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }
}
