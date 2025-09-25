import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MovieService } from '../../../../core/services/movie.service';
import { TheatreService, Theatre } from '../../../../core/services/theatre.service';
import { ShowtimeService, Showtime, TheatreShowtimes } from '../../../../core/services/showtime.service';
import { ReviewService, Review } from '../../../../core/services/review.service';
import { AuthService } from '../../../../core/services/auth.service'; // ✅ Add this import
import { Movie } from '../../../../core/models/movie.model';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './movie-detail.component.html',
  styleUrls: ['./movie-detail.component.scss']
})
export class MovieDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private movieService = inject(MovieService);
  private theatreService = inject(TheatreService);
  private showtimeService = inject(ShowtimeService);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService); // ✅ Add AuthService injection
  private destroy$ = new Subject<void>();

  movie: Movie | null = null;
  theatres: Theatre[] = [];
  theatreShowtimes: TheatreShowtimes[] = [];
  showtimes: Showtime[] = [];
  reviews: Review[] = [];
  selectedDate: string = '';
  dateOptions: { date: string, label: string }[] = [];
  isLoading = true;
  isLoadingShowtimes = false;
  isLoadingReviews = false;
  error = '';

  newReview = {
    rating: 5,
    comment: ''
  };

  currentReviewIndex = 0;
  reviewsToShow = 3;

  @ViewChild('reviewsCarousel', { static: false }) reviewsCarousel!: ElementRef;

  ngOnInit() {
    this.selectedDate = this.getTodayDate();
    this.dateOptions = this.getNextSevenDays();
    const movieId = this.route.snapshot.paramMap.get('movieId');
    if (movieId) {
      this.loadMovieData(movieId);
    } else {
      this.error = 'Movie ID not found';
      this.isLoading = false;
    }
    this.updateReviewsToShow();
    window.addEventListener('resize', this.updateReviewsToShow.bind(this));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.updateReviewsToShow.bind(this));
  }

  private updateReviewsToShow(): void {
    const width = window.innerWidth;
    if (width < 480) {
      this.reviewsToShow = 1;
    } else if (width < 768) {
      this.reviewsToShow = 2;
    } else {
      this.reviewsToShow = 3;
    }
  }

  loadMovieData(movieId: string) {
    this.isLoading = true;
    this.error = '';

    this.movieService.getMovieDetails(movieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: movie => {
          if (movie) {
            this.movie = movie;
            // Load showtimes after movie is loaded
            this.loadShowtimes(movieId, this.selectedDate);
            this.loadReviews(movieId);
          } else {
            this.error = 'Movie not found';
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading movie:', err);
          this.error = 'Failed to load movie details';
          this.isLoading = false;
        }
      });
  }

  loadShowtimes(movieId: string, date: string) {
    this.isLoadingShowtimes = true;

    this.showtimeService.getShowtimes(movieId, date)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (theatreShowtimes: any[]) => {
          this.theatreShowtimes = theatreShowtimes;

          // Extract unique theatres from the response
          this.theatres = theatreShowtimes.map(ts => ({
            _id: ts.theatre.id,
            name: ts.theatre.name,
            location: ts.theatre.location,
            screens: [] // Will be populated if needed
          }));

          // Flatten all showtimes for backward compatibility
          this.showtimes = theatreShowtimes.reduce((acc: any[], theatre) => {
            const mappedShowtimes = theatre.showtimes.map((st: any) => ({
              ...st,
              theatreId: theatre.theatre.id,
              theatreName: theatre.theatre.name
            }));
            return acc.concat(mappedShowtimes);
          }, []);

          this.isLoadingShowtimes = false;
        },
        error: (err) => {
          console.error('Error fetching showtimes:', err);
          this.theatreShowtimes = [];
          this.theatres = [];
          this.showtimes = [];
          this.isLoadingShowtimes = false;
        }
      });
  }

  loadReviews(movieId: string) {
    this.isLoadingReviews = true;
    this.reviewService.getMovieReviews(movieId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.reviews = response.reviews;
          this.isLoadingReviews = false;
        },
        error: (err) => {
          console.error('Error loading reviews:', err);
          // Fallback to mock data if API fails
          this.reviews = this.generateReviews(movieId);
          this.isLoadingReviews = false;
        }
      });
  }

  onDateChange(newDate?: string) {
    if (newDate) this.selectedDate = newDate;
    if (this.movie) {
      this.loadShowtimes(this.movie.imdbID, this.selectedDate);
    }
  }

  selectShowtime(showtime: Showtime) {
    if (!showtime.available || !this.movie) return;

    this.router.navigate(['/booking', this.movie.imdbID, showtime.id], {
      state: {
        movieData: this.movie,
        showtimeData: showtime
      }
    });
  }

  getShowtimesByTheatre(theatreId: string): Showtime[] {
    const theatreShowtimes = this.theatreShowtimes.find(ts => ts.theatre.id === theatreId);
    const result = theatreShowtimes ? theatreShowtimes.showtimes : [];
    return result;
  }

  // Helper methods
  getTheatreName(theatreId: string): string {
    const theatre = this.theatreShowtimes.find(t => t.theatre.id === theatreId);
    return theatre ? theatre.theatre.name : '';
  }

  hasShowtimes(theatreId: string): boolean {
    return this.getShowtimesByTheatre(theatreId).length > 0;
  }

  // TrackBy functions for performance
  trackByTheatreId(index: number, item: TheatreShowtimes): string {
    return item.theatre.id;
  }

  trackByShowtimeId(index: number, item: Showtime): string {
    return item.id;
  }

  // ✅ UPDATED: Real-time user data submission using your existing AuthService
  submitReview() {
    if (this.newReview.comment.trim() && this.movie) {
      // Get current user from your existing auth service
      const currentUser = this.authService.getUser();
      
      if (!currentUser || !currentUser.token) {
        console.error('User not logged in');
        alert('Please log in to submit a review');
        this.router.navigate(['/login']);
        return;
      }
  
      console.log('Submitting review to database...'); // Debug log
  
      const reviewData = {
        movieId: this.movie._id || this.movie.imdbID,
        userId: currentUser.email, // Send email instead of ID
        rating: Number(this.newReview.rating),
        comment: this.newReview.comment.trim(),
        helpful: 0
      };
  
      console.log('Review data:', reviewData); // Debug log
  
      // ✅ This SHOULD save to database
      this.reviewService.addReview(reviewData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (review) => {
            console.log('✅ Review saved to database successfully:', review); // Debug log
            this.reviews.unshift(review);
            this.newReview = { rating: 5, comment: '' };
          },
          error: (err) => {
            console.error('❌ Error saving to database:', err); // Debug log
            
            // Only create local review if database save fails
            const localReview: Review = {
              _id: `local_${Date.now()}`,
              movieId: this.movie?._id || this.movie?.imdbID || '',
              userId: currentUser.email, // Use email for consistency
              rating: Number(this.newReview.rating),
              comment: this.newReview.comment.trim(),
              helpful: 0,
              createdAt: new Date(),
              user: {
                _id: currentUser.id,
                fullName: currentUser.fullName,
                email: currentUser.email
              }
            };
            this.reviews.unshift(localReview);
            this.newReview = { rating: 5, comment: '' };
            console.log('Local review created due to API failure:', localReview);
          }
        });
    }
  }
  
  

  // ✅ ADD: Helper methods for template use
  isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getCurrentUser() {
    return this.authService.getUser();
  }

  getCurrentUserName(): string {
    const user = this.authService.getUser();
    return user?.fullName || 'Guest';
  }

  markReviewHelpful(review: Review) {
    if (!review._id) {
      console.log('No review ID found!');
      return;
    }
  
    // ✅ Check if this is a mock review (starts with 'local_')
    if (review._id.startsWith('local_')) {
      console.log('This is a mock review, updating locally only');
      
      // Update the helpful count locally without API call
      const index = this.reviews.findIndex(r => r._id === review._id);
      if (index !== -1) {
        this.reviews[index] = {
          ...this.reviews[index],
          helpful: (this.reviews[index].helpful || 0) + 1
        };
      }
      return; // ✅ Don't make API call for mock reviews
    }
  
    // ✅ Only make API call for real database reviews
    this.reviewService.markHelpful(review._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedReview) => {
          const index = this.reviews.findIndex(r => r._id === review._id);
          if (index !== -1) {
            this.reviews[index] = updatedReview;
          }
        },
        error: (err) => {
          console.error('Error marking review as helpful:', err);
        }
      });
  }
  

  goBack() {
    this.router.navigate(['/movies']);
  }

  playTrailer() {
    if (this.movie?.Title) {
      const trailerUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(this.movie.Title + ' trailer')}`;
      window.open(trailerUrl, '_blank');
    }
  }

  getMovieGenres(): string[] {
    if (!this.movie?.Genre || this.movie.Genre === 'N/A') return [];
    return this.movie.Genre.split(',').map(g => g.trim());
  }

  getMovieActors(): string[] {
    if (!this.movie?.Actors || this.movie.Actors === 'N/A') return [];
    return this.movie.Actors.split(',').map(a => a.trim()).slice(0, 5);
  }

  getFormattedRuntime(): string {
    if (!this.movie?.Runtime || this.movie.Runtime === 'N/A') {
      return 'Runtime not available';
    }
    return this.movie.Runtime.replace('min', ' minutes');
  }

  formatPriceINR(price: number): string {
    return `₹${price.toFixed(0)}`;
  }

  getImdbRating(): string {
    if (!this.movie?.imdbRating || this.movie.imdbRating === 'N/A') {
      return 'No rating available';
    }
    return `${this.movie.imdbRating}/10 IMDb`;
  }

  getAverageUserRating(): number {
    if (this.reviews.length === 0) return 0;
    const sum = this.reviews.reduce((acc, review) => acc + Number(review.rating), 0);
    return Math.round((sum / this.reviews.length) * 10) / 10;
  }

  getRatingCount(rating: number): number {
    return this.reviews.filter(review => Number(review.rating) === rating).length;
  }

  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) return 0;
    const count = this.getRatingCount(rating);
    return Math.round((count / this.reviews.length) * 100);
  }

  generateStars(rating: number): string[] {
    const stars: string[] = [];
    const numericRating = Number(rating);
    const normalizedRating = Math.max(0, Math.min(numericRating, 5));
    const filledStars = Math.round(normalizedRating);
    for (let i = 0; i < filledStars; i++) stars.push('★');
    for (let i = filledStars; i < 5; i++) stars.push('☆');
    return stars;
  }

  generateImdbStars(): string[] {
    if (!this.movie?.imdbRating || this.movie.imdbRating === 'N/A') {
      return this.generateStars(0);
    }
    const imdbRating = parseFloat(this.movie.imdbRating);
    const scaledRating = (imdbRating / 10) * 5;
    return this.generateStars(scaledRating);
  }

  scrollReviews(direction: 'left' | 'right'): void {
    if (direction === 'left' && this.currentReviewIndex > 0) {
      this.currentReviewIndex = Math.max(0, this.currentReviewIndex - 1);
    } else if (direction === 'right' && this.currentReviewIndex < this.reviews.length - this.reviewsToShow) {
      this.currentReviewIndex = Math.min(this.reviews.length - this.reviewsToShow, this.currentReviewIndex + 1);
    }
    setTimeout(() => {
      if (this.reviewsCarousel) {
        const track = this.reviewsCarousel.nativeElement.querySelector('.reviews-track');
        if (track) {
          const cardWidth = track.querySelector('.review-card')?.offsetWidth || 0;
          const gap = 20;
          const scrollPosition = this.currentReviewIndex * (cardWidth + gap);
          track.style.transform = `translateX(-${scrollPosition}px)`;
        }
      }
    }, 10);
  }

  private generateReviews(movieId: string): Review[] {
    if (!this.movie) return [];
    const sampleAuthors = [
      'MovieBuff2024', 'CinemaLover', 'FilmCritic99', 'PopcornFan',
      'ActionHero', 'DramaQueen', 'SciFiGeek', 'ComedyGold'
    ];
    const reviews: Review[] = [];
    const numReviews = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < numReviews; i++) {
      const rating = Math.floor(Math.random() * 5) + 1;
      const author = sampleAuthors[Math.floor(Math.random() * sampleAuthors.length)];
      reviews.push({
        _id: `review_${i + 1}`,
        movieId: movieId,
        userId: `user_${i + 1}`,
        rating,
        comment: this.generateReviewComment(rating, this.movie.Title),
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        helpful: Math.floor(Math.random() * 50),
        user: {
          _id: `user_${i + 1}`,
          fullName: author,
          email: `${author.toLowerCase()}@example.com`
        }
      });
    }
    return reviews.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  private generateReviewComment(rating: number, movieTitle: string): string {
    const positiveComments = [
      `Amazing movie! ${movieTitle} exceeded all my expectations.`,
      `Absolutely loved this film! Great cinematography.`,
      `One of the best movies I've seen this year.`,
      `Fantastic storytelling and brilliant execution.`,
      `Incredible film with outstanding visual effects.`
    ];
    const neutralComments = [
      `${movieTitle} was decent with some ups and downs.`,
      `Good movie overall, entertaining enough.`,
      `Solid film, though not groundbreaking.`,
      `Average movie with some memorable moments.`
    ];
    const negativeComments = [
      `Disappointing. ${movieTitle} didn't live up to the hype.`,
      `Found this movie quite boring.`,
      `Not impressed with this one.`,
      `Expected more from this film.`
    ];
    if (rating >= 4) {
      return positiveComments[Math.floor(Math.random() * positiveComments.length)];
    } else if (rating >= 3) {
      return neutralComments[Math.floor(Math.random() * neutralComments.length)];
    } else {
      return negativeComments[Math.floor(Math.random() * negativeComments.length)];
    }
  }

  private getTodayDate(): string {
    // Build local YYYY-MM-DD to avoid timezone shifting the day
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  getNextSevenDays(): { date: string, label: string }[] {
    const dates = [] as { date: string, label: string }[];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ date: dateStr, label });
    }
    return dates;
  }

  getGenreBadgeColor(genre: string): string {
    const colors: { [key: string]: string } = {
      'Action': '#ef4444',
      'Adventure': '#f59e0b',
      'Comedy': '#10b981',
      'Drama': '#6366f1',
      'Horror': '#7c2d12',
      'Romance': '#ec4899',
      'Sci-Fi': '#06b6d4',
      'Science Fiction': '#06b6d4',
      'Thriller': '#8b5cf6',
      'Mystery': '#8b5cf6',
      'Crime': '#dc2626',
      'Fantasy': '#a855f7',
      'Animation': '#f97316',
      'Family': '#22c55e',
      'Biography': '#64748b',
      'History': '#92400e',
      'War': '#991b1b',
      'Western': '#a16207',
      'Musical': '#db2777',
      'Sport': '#059669'
    };
    return colors[genre] || '#64748b';
  }

  onImageError(event: any) {
    event.target.src = 'assets/placeholder.jpg';
  }
}
