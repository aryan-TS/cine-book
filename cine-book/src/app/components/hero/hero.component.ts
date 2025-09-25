import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button'; // if you use mat-raised-button

@Component({
  selector: 'app-hero',
  standalone: true, //  make it standalone
  imports: [RouterModule, MatButtonModule], // import modules used in template
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'], // create this file if not exists
})
export class HeroComponent {
  constructor(private auth: AuthService, private router: Router) {}

  goToMovies() {
    const target = '/movies';
    if (this.auth.isLoggedIn()) {
      this.router.navigateByUrl(target);
    } else {
      // redirect to login tab and remember target
      this.router.navigate(['/profile'], {
        queryParams: { tab: 'login', returnUrl: target },
      });
    }
  }
}
