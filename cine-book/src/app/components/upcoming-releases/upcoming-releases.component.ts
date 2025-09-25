import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../core/models/movie.model';

@Component({
  selector: 'app-upcoming-releases',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './upcoming-releases.component.html',
  styleUrls: ['./upcoming-releases.component.scss'],
})
export class UpcomingReleasesComponent implements OnInit {
  upcomingMovies: Movie[] = [];

  // List of IMDb IDs for upcoming 2026 movies
  private upcomingImdbIDs = [
    'tt22898462', // Replace with real IMDb IDs
    'tt1757678', // Avatar 3
    'tt5950044',//superman
    'tt4712810',// now you see me 3
    'tt26443597',
    'tt19847976',
  ];

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    // fetch details for those 6
    const detailCalls = this.upcomingImdbIDs.map(id => this.movieService.getMovieDetails(id));
    detailCalls.forEach((obs, idx) => {
      obs.subscribe({
        next: (movieDetail) => {
          if (movieDetail) {
            this.upcomingMovies.push(movieDetail);
          }
        },
        error: (err) => console.error('Error fetching upcoming movie detail for', this.upcomingImdbIDs[idx], err)
      });
    });
  }
}
