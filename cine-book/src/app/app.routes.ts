import { Routes } from '@angular/router';

// User Components
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MovieListComponent } from './components/movies/movie-list/movie-list.component';
import { MovieDetailComponent } from './components/movies/movie-list/movie-details/movie-details.component';
import { SeatBookingComponent } from './components/seat-booking/seat-booking.component';
import { PaymentComponent } from './components/payment/payment.component';

// Admin Components
import { AdminLayoutComponent } from './admin/admin-layout.component';
import { DashboardComponent } from './admin/features/dashboard/dashboard.component';
import { MoviesComponent } from './admin/features/movies/movies.component';
import { BookingsComponent } from './admin/features/bookings/bookings.component';
import { CustomersComponent } from './admin/features/customers/customers.component';
import { AnalyticsComponent } from './admin/features/analytics/analytics.component';
import { TheatresComponent } from './admin/features/theatres/theatres.component';
import { ShowsComponent } from './admin/features/shows/shows.component';

//error component
import { ErrorComponent } from './components/error/error.component';

// Guards
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard'; // make sure this path is correct

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // User Routes
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'movies', component: MovieListComponent, canActivate: [authGuard] },
  {
    path: 'movies/:movieId',
    component: MovieDetailComponent,
    canActivate: [authGuard],
  },
  {
    path: 'booking/:movieId/:showtimeId',
    component: SeatBookingComponent,
    canActivate: [authGuard],
  },
  { path: 'payment', component: PaymentComponent, canActivate: [authGuard] },

  // Admin Routes (Protected by adminGuard)
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard], // PROTECT ALL ADMIN ROUTES
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'movies', component: MoviesComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'customers', component: CustomersComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'theatres', component: TheatresComponent },
      { path: 'shows', component: ShowsComponent },
    ],
  },

  // Wildcard fallback
  { path: '**', component: ErrorComponent },
];
