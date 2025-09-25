import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  isLoggedIn = false;
  loggedInName: string | null = null;
  role: 'admin' | 'user' | null = null;

  constructor(private router: Router, private auth: AuthService) {
    // Subscribe to auth changes
    this.auth.loggedInUser$.subscribe((user) => {
      this.isLoggedIn = !!user;
      this.loggedInName = user?.fullName || null;
      this.role = user?.role || null;
    });
  }

  onSelectRole(role: 'Admin' | 'User') {
    if (role === 'Admin') {
      if (this.isLoggedIn && this.role === 'admin') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/profile'], {
          queryParams: { role: 'admin', tab: 'login', returnUrl: '/admin' },
        });
      }
    } else {
      if (this.isLoggedIn && this.role === 'user') {
        this.router.navigate(['/movies']);
      } else {
        this.router.navigate(['/profile'], {
          queryParams: { role: 'user', tab: 'login', returnUrl: '/movies' },
        });
      }
    }
  }

  logout() {
    this.auth.logout();
    this.isLoggedIn = false;
    this.loggedInName = null;
    this.role = null;
    this.router.navigate(['/home']);
  }
}
