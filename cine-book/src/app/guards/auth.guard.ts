import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService); // get AuthService
  const router = inject(Router); // get Router

  if (auth.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/profile'], {
      queryParams: { tab: 'login', returnUrl: state.url },
    });
    return false;
  }
};
