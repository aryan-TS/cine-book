import { Routes } from '@angular/router';
export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin-layout.component').then((c) => c.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (c) => c.DashboardComponent
          ),
      },
      {
        path: 'movies',
        loadComponent: () =>
          import('./features/movies/movies.component').then(
            (c) => c.MoviesComponent
          ),
      },
      

      {
        path: 'theatres',
        loadComponent: () =>
            import('./features/theatres/theatres.component').then(
                (c) => c.TheatresComponent
            ),
      },
      {
        path: 'shows',
        loadComponent: () =>
            import('./features/shows/shows.component').then(
                (c) => c.ShowsComponent
            ),
      },

      {
        path: 'bookings',
        loadComponent: () =>
          import('./features/bookings/bookings.component').then(
            (c) => c.BookingsComponent
          ),
      },
      {
        path: 'customers',
        loadComponent: () =>
          import('./features/customers/customers.component').then(
            (c) => c.CustomersComponent
          ),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/analytics/analytics.component').then(
            (c) => c.AnalyticsComponent
          ),
      },
    
    ],
  },
];
