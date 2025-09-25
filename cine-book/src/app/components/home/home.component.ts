import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { HeroComponent } from '../hero/hero.component';
import { FeaturedMoviesComponent } from '../featured-movies/featured-movies.component';
import { UpcomingReleasesComponent } from '../upcoming-releases/upcoming-releases.component';
import { TestimonialsComponent } from '../testimonials/testimonials.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    FeaturedMoviesComponent,
    UpcomingReleasesComponent,
    TestimonialsComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {}
