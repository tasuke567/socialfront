import { Routes } from '@angular/router';
import { authGuard, publicOnlyGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login/login.component';
import { RegisterComponent } from './components/register/register/register.component';
import { FriendsComponent } from './features/friends/components/friends-list/friends.component';
import { HomeComponent } from './features/home/components/home/home.component';

export const routes: Routes = [
  { 
    path: '', 
    component: HomeComponent  
  },
  { 
    path: 'friends', 
    component: FriendsComponent,
    canActivate: [authGuard] // เข้าถึงได้เฉพาะผู้ที่ล็อกอินแล้ว
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicOnlyGuard] // เข้าถึงได้เฉพาะผู้ที่ยังไม่ล็อกอิน
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [publicOnlyGuard] // เข้าถึงได้เฉพาะผู้ที่ยังไม่ล็อกอิน
  },
  { 
    path: '**', 
    redirectTo: '' // เปลี่ยนเส้นทางไป Home หาก URL ไม่ถูกต้อง
  }
];
