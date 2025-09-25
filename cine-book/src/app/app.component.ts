import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { FeaturedMoviesComponent } from './components/featured-movies/featured-movies.component';
import { UpcomingReleasesComponent } from './components/upcoming-releases/upcoming-releases.component';
import { TestimonialsComponent } from './components/testimonials/testimonials.component';
import { FooterComponent } from './components/footer/footer.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    HeroComponent,
    HeaderComponent,
    FeaturedMoviesComponent,
    UpcomingReleasesComponent,
    TestimonialsComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'cine-book';
}
