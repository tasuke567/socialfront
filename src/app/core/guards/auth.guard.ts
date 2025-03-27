import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { first, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

/**
 * Guard สำหรับเส้นทางที่ต้องการให้ผู้ใช้ล็อกอินแล้วเท่านั้น
 * ถ้าผู้ใช้ล็อกอินแล้ว จะคืนค่าเป็น true
 * ถ้าไม่ล็อกอิน จะคืนค่า UrlTree เพื่อ redirect ไปที่หน้า /login
 */
export const authGuard = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    first(), // รับค่าแรกแล้ว unsubscribe
    map((isLoggedIn) => isLoggedIn ? true : router.createUrlTree(['/login']))
  );
};

/**
 * Guard สำหรับเส้นทางที่ต้องการให้ผู้ใช้ที่ยังไม่ล็อกอินเข้าถึงได้เท่านั้น
 * ถ้ายังไม่ล็อกอิน จะคืนค่าเป็น true
 * ถ้าล็อกอินแล้ว จะคืนค่า UrlTree เพื่อ redirect ไปที่หน้า /friends
 */
export const publicOnlyGuard = (): Observable<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoggedIn$.pipe(
    first(),
    map((isLoggedIn) => !isLoggedIn ? true : router.createUrlTree(['/friends']))
  );
};
