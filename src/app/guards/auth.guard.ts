import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { first, map } from 'rxjs/operators';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    first(),
    map((isLoggedIn) => (isLoggedIn ? true : router.createUrlTree(['/login'])))
  );
};

export const publicOnlyGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    first(),
    map((isLoggedIn) => (!isLoggedIn ? true : router.createUrlTree(['/friends'])))
  );
};
