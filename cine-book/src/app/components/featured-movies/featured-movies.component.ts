import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-featured-movies',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  templateUrl: './featured-movies.component.html',
  styleUrls: ['./featured-movies.component.scss'],
})
export class FeaturedMoviesComponent implements OnInit {
  featuredMovies: any[] = [];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.movieService.getMoviesFromDB().subscribe({
      next: (movies) => {
        // pick max 4 movies
        const selected = movies.slice(0, 4);

        // fetch full details from OMDb for each
        selected.forEach((movie) => {
          this.movieService.getMovieDetails(movie.imdbID).subscribe((details) => {
            if (details) {
              this.featuredMovies.push({
                title: details.Title,
                genres: details.Genre,
                rating: details.imdbRating,
                posterUrl: details.Poster,
              });
            }
          });
        });
      },
      error: (err) => console.error('Error loading featured movies:', err),
    });
  }
}
